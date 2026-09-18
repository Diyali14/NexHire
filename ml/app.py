"""Internal AI service — Resume Parser + future AI services."""

import base64
import hmac
import os
import re
import tempfile
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from language_service import detect_language, is_english
from lm_studio_parser import (
    parse_resume_with_lm_studio,
    parse_resume_from_image_with_lm_studio,
    extract_jd_skills_with_lm_studio,
    match_candidate_with_lm_studio,
    generate_interview_questions_with_lm_studio,
)
from parsers import extract_text, ScannedPDFError, pdf_to_page_images

app = FastAPI(title="Resume Matcher AI Service", version="2.0.0")


# ---------------------------------------------------------------------------
# Auth middleware
# ---------------------------------------------------------------------------

@app.middleware("http")
async def protect_internal_api(request: Request, call_next):
    """Require a gateway-held service key outside local development."""
    expected_key = os.getenv("AI_SERVICE_API_KEY", "")
    if request.url.path.startswith("/ai/v1") and expected_key:
        supplied_key = request.headers.get("X-AI-Service-Key", "")
        if not hmac.compare_digest(supplied_key, expected_key):
            return JSONResponse(status_code=401, content={"detail": "Invalid AI service key."})
    return await call_next(request)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _clean_text(text: str) -> str:
    """Basic cleaning — preserves all resume information, fixes encoding artefacts."""
    text = text.replace("\\n", "\n").replace("\x00", "")
    text = text.replace("«", "*").replace("¢", "*").replace("•", "*")
    text = text.replace("\ufffd", "'").replace("\u00b7", "|").replace("\u2013", "-")
    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in text.splitlines()]
    return "\n".join(line for line in lines if line).strip()


def _build_parse_response(parsed: dict[str, Any]) -> dict[str, Any]:
    """Wrap a parsed resume dict in the standard API envelope."""
    return {
        "status": "COMPLETED",
        "language": "en",
        "resume": parsed,
        "warnings": [],
        "parserVersion": "2.0.0-lm-studio",
    }


def _resume_payload(text: str) -> dict[str, Any]:
    text = _clean_text(text)
    if not text:
        raise ValueError("No readable text could be extracted from this resume.")
    if not is_english(text):
        lang = detect_language(text)
        raise ValueError(
            f"This service only accepts resumes written in English. "
            f"Detected language: {lang.upper()}."
        )
    parsed = parse_resume_with_lm_studio(text)
    return _build_parse_response(parsed)


def _image_parse_response(parsed: dict[str, Any]) -> dict[str, Any]:
    """Check language gate on an image-parsed result and return the envelope."""
    detected_lang = parsed.pop("detected_language", "en") or "en"
    if detected_lang.lower() != "en":
        raise HTTPException(
            status_code=422,
            detail=(
                f"This service only accepts resumes written in English. "
                f"Detected language: {detected_lang.upper()}."
            ),
        )
    return _build_parse_response(parsed)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-service", "version": app.version}


@app.post("/ai/v1/parse-resume-file")
async def parse_resume_file(file: UploadFile = File(...)):
    """Parse a resume uploaded as a file (PDF, DOCX, TXT, JPG, JPEG)."""
    image_types = {"image/jpeg", "image/jpg"}
    text_types = {
        "application/pdf": "pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
        "text/plain": "txt",
    }

    content_type = file.content_type or ""

    if content_type not in image_types and content_type not in text_types:
        raise HTTPException(
            status_code=415,
            detail="Only PDF, DOCX, TXT, and JPG/JPEG files are supported.",
        )

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=422, detail="The uploaded file is empty.")

    # --- Image path: raw bytes -> LM Studio vision API ---
    if content_type in image_types:
        try:
            parsed = parse_resume_from_image_with_lm_studio(contents, mime_type=content_type)
            return _image_parse_response(parsed)
        except HTTPException:
            raise
        except (RuntimeError, ValueError) as error:
            raise HTTPException(status_code=422, detail=str(error)) from error

    # --- Text/document path: extract text -> LLM ---
    document_type = text_types[content_type]
    with tempfile.NamedTemporaryFile(suffix=f".{document_type}", delete=False) as tmp:
        tmp.write(contents)
        tmp_path = Path(tmp.name)

    try:
        extracted_text = extract_text(str(tmp_path))
        return _resume_payload(extracted_text)
    except ScannedPDFError:
        # Scanned PDF — render pages as images and send to LM Studio vision API.
        try:
            page_images = pdf_to_page_images(str(tmp_path))
            parsed = parse_resume_from_image_with_lm_studio(page_images, mime_type="image/jpeg")
            return _image_parse_response(parsed)
        except HTTPException:
            raise
        except (RuntimeError, ValueError) as error:
            raise HTTPException(status_code=422, detail=str(error)) from error
    except (RuntimeError, ValueError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Unexpected error during parsing: {error}") from error
    finally:
        tmp_path.unlink(missing_ok=True)


# ---------------------------------------------------------------------------
# Service 2 — JD Skill Extractor
# ---------------------------------------------------------------------------

@app.post("/ai/v1/analyze-jd")
async def analyze_jd(request: Request):
    """Extract skills and hiring requirements from a raw job description.

    Accepts plain text (Content-Type: text/plain). The backend sends the
    job description as-is — no JSON encoding required.
    """
    body = await request.body()
    text = body.decode("utf-8", errors="replace").strip()
    if not text:
        raise HTTPException(status_code=422, detail="Request body must contain the job description text.")
    try:
        result = extract_jd_skills_with_lm_studio(text)
        return {
            "status": "COMPLETED",
            "modelVersion": "2.0.0-lm-studio",
            **result,
        }
    except (RuntimeError, ValueError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Unexpected error during JD analysis: {error}") from error


# ---------------------------------------------------------------------------
# Service 3 — Candidate–Job Matcher
# ---------------------------------------------------------------------------

class MatchRequest(BaseModel):
    candidate: dict[str, Any] = Field(
        description="The resume object from /ai/v1/parse-resume-file (the inner 'resume' field)."
    )
    jobRequirements: dict[str, Any] = Field(
        description="The full response from /ai/v1/analyze-jd."
    )


@app.post("/ai/v1/match")
def match(request: MatchRequest):
    """Score a candidate against job requirements.

    Experience is a hard gate — if the candidate does not meet the minimum
    years required, overallScore is forced to 0 regardless of skills.
    Otherwise the score is weighted: skills 70%, education 15%, experience surplus 15%.
    """
    try:
        result = match_candidate_with_lm_studio(request.candidate, request.jobRequirements)
        return {
            "status": "COMPLETED",
            "modelVersion": "2.0.0-lm-studio",
            **result,
        }
    except (RuntimeError, ValueError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Unexpected error during matching: {error}") from error


# ---------------------------------------------------------------------------
# Service 4 — Skill Gap Advisor
# ---------------------------------------------------------------------------

@app.post("/ai/v1/skill-gap")
def skill_gap(request: MatchRequest):
    """Identify which skills a candidate is missing for a specific job.

    Internally runs the same matching logic as /ai/v1/match and extracts
    the gap. Returns a plain-English statement the candidate can read directly,
    plus a structured list of missing skills grouped by importance.
    """
    try:
        result = match_candidate_with_lm_studio(request.candidate, request.jobRequirements)
    except (RuntimeError, ValueError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Unexpected error during skill gap analysis: {error}") from error

    job_title = request.jobRequirements.get("jobTitle") or "this role"
    missing = result.get("missingSkills", [])
    experience_met = result.get("experienceMet", True)
    exp_line = ""

    if not experience_met:
        # Extract years info from the summary for the message
        exp_line = result.get("summary", "You do not meet the minimum experience requirement for this role.")

    # Group missing skills by importance
    high   = [s["name"] for s in missing if s.get("importance") == "HIGH"]
    medium = [s["name"] for s in missing if s.get("importance") == "MEDIUM"]
    low    = [s["name"] for s in missing if s.get("importance") == "LOW"]

    # Build the statement
    if not experience_met and not missing:
        message = exp_line
    elif not missing:
        message = f"Great news! You have all the required skills for the {job_title} role."
    else:
        parts = []
        if high:
            parts.append(f"mandatory skills: {', '.join(high)}")
        if medium:
            parts.append(f"important skills: {', '.join(medium)}")
        if low:
            parts.append(f"preferred skills: {', '.join(low)}")

        skill_sentence = "To strengthen your application for the " + job_title + " role, you should work on the following — " + "; ".join(parts) + "."

        if not experience_met:
            message = exp_line + " Additionally, " + skill_sentence[0].lower() + skill_sentence[1:]
        else:
            message = skill_sentence

    return {
        "status": "COMPLETED",
        "jobTitle": job_title,
        "hasGap": bool(missing) or not experience_met,
        "experienceMet": experience_met,
        "message": message,
        "missingSkills": missing,
    }



# ---------------------------------------------------------------------------
# Service 5 — Interview Question Generator
# ---------------------------------------------------------------------------

@app.post("/ai/v1/interview-questions")
async def interview_questions(request: Request):
    """Generate a set of expected interview questions for a job role.

    Accepts the raw JD analysis JSON from /ai/v1/analyze-jd directly as the body —
    no wrapper object needed. Returns at least 10 questions tailored to the role's
    skills and seniority, formatted as numbered text for the candidate to read.
    """
    try:
        jd = await request.json()
    except Exception:
        raise HTTPException(status_code=422, detail="Request body must be a valid JSON object (the output of /ai/v1/analyze-jd).")

    if not isinstance(jd, dict) or not jd.get("skills"):
        raise HTTPException(status_code=422, detail="Invalid input: expected a JD analysis object with a 'skills' field.")

    try:
        questions = generate_interview_questions_with_lm_studio(jd)
    except (RuntimeError, ValueError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Unexpected error generating interview questions: {error}") from error

    job_title = jd.get("jobTitle") or "the role"
    formatted = "\n".join(f"{i}. {q}" for i, q in enumerate(questions, start=1))

    return {
        "status": "COMPLETED",
        "jobTitle": job_title,
        "totalQuestions": len(questions),
        "questionsText": formatted,
        "questions": questions,
    }
