import json
import os
import re
from typing import Any

import requests
from dotenv import load_dotenv

from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

DEFAULT_BASE_URL = "http://127.0.0.1:1234/v1/models"
DEFAULT_MODEL = "google/gemma-4-e4b"

GEMINI_GENERATE_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
)
GEMINI_DEFAULT_MODEL = "gemini-3.1-flash-lite"


def _strip_schema_for_gemini(schema: Any) -> Any:
    """Recursively remove JSON Schema fields Gemini does not accept."""
    if isinstance(schema, dict):
        cleaned = {}
        for k, v in schema.items():
            if k in ("additionalProperties", "strict"):
                continue
            cleaned[k] = _strip_schema_for_gemini(v)
        return cleaned
    if isinstance(schema, list):
        return [_strip_schema_for_gemini(i) for i in schema]
    return schema


def _call_gemini_native(payload: dict, timeout: float) -> "requests.Response":
    """Call the native Gemini generateContent API and return an OpenAI-shaped Response.

    Uses the AI Studio key directly as a query parameter — the method that always
    works with keys from aistudio.google.com.
    """
    key = os.getenv("GEMINI_API_KEY", "").strip()
    model = os.getenv("GEMINI_MODEL", GEMINI_DEFAULT_MODEL).strip()
    url = GEMINI_GENERATE_URL.format(model=model, key=key)

    # ── Convert OpenAI messages → Gemini contents ────────────────────────────
    messages = payload.get("messages", [])
    system_text = ""
    contents = []
    for msg in messages:
        role = msg.get("role", "user")
        raw_content = msg.get("content", "")

        # Handle multimodal content (list of parts — used by image parser)
        if isinstance(raw_content, list):
            parts = []
            for part in raw_content:
                if part.get("type") == "text":
                    parts.append({"text": part["text"]})
                elif part.get("type") == "image_url":
                    data_url = part["image_url"]["url"]
                    # data:image/jpeg;base64,<data>
                    if data_url.startswith("data:"):
                        mime, b64 = data_url[5:].split(";base64,", 1)
                        parts.append({"inlineData": {"mimeType": mime, "data": b64}})
            if role == "system":
                # Gemini doesn't support multimodal system messages — skip
                pass
            else:
                contents.append({"role": "user", "parts": parts})
        else:
            if role == "system":
                system_text = raw_content
            else:
                gemini_role = "model" if role == "assistant" else "user"
                contents.append({"role": gemini_role, "parts": [{"text": raw_content}]})

    # ── Build Gemini request body ─────────────────────────────────────────────
    gen_config: dict[str, Any] = {
        "temperature": payload.get("temperature", 0),
        "maxOutputTokens": payload.get("max_tokens", 2000),
    }

    rf = payload.get("response_format", {})
    if rf.get("type") == "json_schema":
        gen_config["responseMimeType"] = "application/json"
        raw_schema = rf.get("json_schema", {}).get("schema")
        if raw_schema:
            gen_config["responseSchema"] = _strip_schema_for_gemini(raw_schema)

    gemini_body: dict[str, Any] = {
        "contents": contents,
        "generationConfig": gen_config,
    }
    if system_text:
        gemini_body["system_instruction"] = {"parts": [{"text": system_text}]}

    # ── Call Gemini ───────────────────────────────────────────────────────────
    raw_resp = requests.post(
        url,
        headers={"Content-Type": "application/json"},
        json=gemini_body,
        timeout=timeout,
    )
    raw_resp.raise_for_status()
    gemini_data = raw_resp.json()

    # ── Wrap response to look like OpenAI — downstream code unchanged ─────────
    try:
        text = gemini_data["candidates"][0]["content"]["parts"][0]["text"]
        finish = gemini_data["candidates"][0].get("finishReason", "STOP")
    except (KeyError, IndexError) as exc:
        raise requests.RequestException(
            f"Gemini returned unexpected response structure: {gemini_data}"
        ) from exc

    openai_shaped = {
        "choices": [{
            "message": {"role": "assistant", "content": text},
            "finish_reason": "length" if finish == "MAX_TOKENS" else "stop",
        }]
    }
    mock = requests.models.Response()
    mock.status_code = 200
    mock._content = json.dumps(openai_shaped).encode("utf-8")
    return mock


def _call_with_fallback(url: str, payload: dict, timeout: float) -> "requests.Response":
    """POST to LM Studio first; on any connection or HTTP failure retry with Gemini.

    The Gemini fallback is only attempted when GEMINI_API_KEY is set in the
    environment. If the key is absent, the original error is re-raised so the
    caller's existing error-handling still works normally.
    """
    lm_err = None
    try:
        resp = requests.post(
            url,
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=timeout,
        )
        resp.raise_for_status()
        return resp
    except requests.RequestException as e:
        lm_err = e

    # LM Studio failed — check for Gemini fallback
    key = os.getenv("GEMINI_API_KEY", "").strip()
    if not key:
        raise lm_err  # No fallback configured — re-raise original error

    print(f"[FALLBACK] LM Studio unavailable ({lm_err}). Retrying with Gemini...")
    try:
        return _call_gemini_native(payload, timeout)
    except requests.RequestException as gemini_err:
        raise requests.RequestException(
            f"Both LM Studio and Gemini fallback failed. "
            f"LM Studio: {lm_err}. Gemini: {gemini_err}."
        ) from gemini_err




def _json_from_content(content: str) -> dict[str, Any]:
    content = content.strip()
    if content.startswith("```"):
        content = re.sub(r"^```(?:json)?\s*", "", content, flags=re.IGNORECASE)
        content = re.sub(r"\s*```$", "", content)

    decoder = json.JSONDecoder()
    try:
        value, _ = decoder.raw_decode(content)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", content, flags=re.DOTALL)
        if not match:
            raise ValueError("LM Studio returned no JSON object.")
        try:
            value = json.loads(match.group(0))
        except json.JSONDecodeError as error:
            raise ValueError(
                f"LM Studio returned malformed JSON at line {error.lineno}, "
                f"column {error.colno}: {error.msg}"
            ) from error

    if not isinstance(value, dict):
        raise ValueError("LM Studio returned JSON with an invalid root type.")
    return value


def _string(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


def _list_of_strings(value: object) -> list[str]:
    if not isinstance(value, list):
        return []
    return [_string(item) for item in value if _string(item)]


def _normalize_skill(value: object) -> dict[str, Any] | None:
    if isinstance(value, str):
        name = value.strip()
        confidence = 0.8
    elif isinstance(value, dict):
        name = _string(value.get("name") or value.get("skill"))
        confidence = value.get("confidence", 0.8)
    else:
        return None
    if not name:
        return None
    try:
        confidence = max(0.0, min(1.0, float(confidence)))
    except (TypeError, ValueError):
        confidence = 0.8
    return {
        "name": name,
        "normalizedName": re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_"),
        "confidence": confidence,
    }


def _normalize_education(value: object) -> list[dict[str, str]]:
    if not isinstance(value, list):
        return []
    entries = []
    for item in value:
        if not isinstance(item, dict):
            continue
        entries.append({
            "degree": _string(item.get("degree") or item.get("qualification")),
            "institution": _string(item.get("institution") or item.get("school")),
            "end_year": _string(item.get("end_year") or item.get("year") or item.get("graduation_year")),
            "grade": _string(item.get("grade") or item.get("cgpa") or item.get("percentage")),
        })
    return [entry for entry in entries if any(entry.values())]


def _normalize_experience(value: object) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    entries = []
    for item in value:
        if not isinstance(item, dict):
            continue
        entry = {
            "company": _string(item.get("company") or item.get("employer")),
            "job_title": _string(item.get("job_title") or item.get("title") or item.get("role")),
            "location": _string(item.get("location")),
            "responsibilities": _list_of_strings(item.get("responsibilities") or item.get("duties")),
            "technologies": _list_of_strings(item.get("technologies") or item.get("tools")),
            "additional_information": _list_of_strings(item.get("additional_information")),
        }
        for key in ("start_date", "end_date"):
            value = _string(item.get(key))
            if value:
                entry[key] = value
        if any(entry[key] for key in ("company", "job_title", "location", "responsibilities")):
            entries.append(entry)
    return entries


def _normalize_projects(value: object) -> list[dict[str, str]]:
    if not isinstance(value, list):
        return []
    projects = []
    for item in value:
        if isinstance(item, str):
            if item.strip():
                projects.append({"name": item.strip(), "description": ""})
        elif isinstance(item, dict):
            name = _string(item.get("name") or item.get("title"))
            description = _string(item.get("description") or item.get("details"))
            if name or description:
                projects.append({"name": name, "description": description})
    return projects


def normalize_resume(value: dict[str, Any]) -> dict[str, Any]:
    resume = value.get("resume") if isinstance(value.get("resume"), dict) else value
    skills = []
    for item in resume.get("skills", []):
        normalized = _normalize_skill(item)
        if normalized and normalized["normalizedName"] != "spring":
            skills.append(normalized)

    return {
        "name": _string(resume.get("name") or resume.get("candidate_name")),
        "email": _string(resume.get("email")),
        "phone": _string(resume.get("phone")),
        "skills": skills,
        "education": _normalize_education(resume.get("education")),
        "experience": _normalize_experience(resume.get("experience")),
        "years_of_experience": resume.get("years_of_experience", 0),
        "projects": _normalize_projects(resume.get("projects")),
        "certifications": _string(resume.get("certifications")),
        "links": resume.get("links") if isinstance(resume.get("links"), dict) else {},
    }


def parse_resume_with_lm_studio(text: str) -> dict[str, Any]:
    if not text.strip():
        raise ValueError("Cannot send empty resume text to LM Studio.")

    base_url = os.getenv("LM_STUDIO_BASE_URL", DEFAULT_BASE_URL).strip()
    url = os.getenv("LM_STUDIO_URL", "").strip()
    if not url:
        url = re.sub(r"/models/?$", "/chat/completions", base_url)
    model = os.getenv("LM_STUDIO_MODEL", DEFAULT_MODEL).strip()
    timeout = float(os.getenv("LM_STUDIO_TIMEOUT", "90"))
    schema = {
        "name": "",
        "email": "",
        "phone": "",
        "skills": [{"name": "", "confidence": 0.0}],
        "education": [{"degree": "", "institution": "", "end_year": "", "grade": ""}],
        "experience": [{
            "company": "", "job_title": "", "location": "",
            "responsibilities": [], "technologies": [],
            "start_date": "", "end_date": "",
        }],
        "years_of_experience": 0,
        "projects": [{"name": "", "description": ""}],
        "certifications": "",
        "links": {},
    }
    prompt = (
        "Extract structured information from this resume. Return ONLY one valid JSON object "
        "matching the schema below.\n\n"

        "GENERAL RULES:\n"
        "- Do not infer employment from an objective or project section.\n"
        "- Do not put employers in education. Education must contain only real degrees/schools; "
        "use end_year only, never start_year.\n"
        "- Preserve missing values as empty strings/lists.\n"
        "- Ignore standalone 'Spring' unless the resume explicitly says 'Spring Boot'.\n"
        "- Keep responsibilities concise: maximum 8 items per job, maximum 180 characters each.\n"
        "- Do not copy the entire resume into JSON — summarize/structure it.\n\n"

        "SKILLS EXTRACTION (read carefully, this is the field most often done wrong):\n"
        "- Scan the ENTIRE resume for skills, not just a labeled 'Skills' section. Include tools, "
        "languages, frameworks, and technologies mentioned in work experience bullets, project "
        "descriptions, and certifications — not only ones explicitly listed under a 'Skills' heading.\n"
        "- Normalize variants to a single canonical form (e.g. 'JS' and 'Javascript' -> 'JavaScript'; "
        "'Node' and 'Node.js' -> 'Node.js'). Do not list the same skill twice under different spellings.\n"
        "- Do not truncate the list to an arbitrary count. Include every distinct real skill you find, "
        "deduplicated. If the resume genuinely lists 40 tools, return 40 — do not cut it down.\n"
        "- Exclude soft skills (e.g. 'communication', 'teamwork') unless the schema has a separate field "
        "for them — assume technical/professional skills only unless told otherwise.\n"
        "- Do not invent or infer skills that aren't stated or clearly demonstrated (e.g. don't add "
        "'Docker' just because the person mentions 'deployed a containerized app' unless Docker is named).\n\n"

        f"SCHEMA:\n{json.dumps(schema, ensure_ascii=True)}\n\n"
        f"RESUME TEXT:\n{text[:40000]}"
    )
    response = None
    try:
        payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": "You are a precise resume information extraction service."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0,
                "max_tokens": 6000,
                "chat_template_kwargs": {"enable_thinking": False},
                # LM Studio supports "text" and "json_schema" here, but not the
                # OpenAI-only "json_object" value. The prompt still requires a
                # single JSON object, which _json_from_content validates.
                "response_format": {
                    "type": "json_schema",
                    "json_schema": {
                        "name": "resume_extraction",
                        "strict": True,
                        "schema": {
                            "type": "object",
                            "additionalProperties": False,
                            "properties": {
                                "name": {"type": "string"},
                                "email": {"type": "string"},
                                "phone": {"type": "string"},
                                "skills": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "additionalProperties": False,
                                        "properties": {
                                            "name": {"type": "string"},
                                            "confidence": {"type": "number"},
                                        },
                                        "required": ["name", "confidence"],
                                    },
                                },
                                "education": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "additionalProperties": False,
                                        "properties": {
                                            "degree": {"type": "string"},
                                            "institution": {"type": "string"},
                                            "end_year": {"type": "string"},
                                            "grade": {"type": "string"},
                                        },
                                        "required": ["degree", "institution", "end_year", "grade"],
                                    },
                                },
                                "experience": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "additionalProperties": False,
                                        "properties": {
                                            "company": {"type": "string"},
                                            "job_title": {"type": "string"},
                                            "location": {"type": "string"},
                                            "responsibilities": {"type": "array", "items": {"type": "string"}},
                                            "technologies": {"type": "array", "items": {"type": "string"}},
                                            "additional_information": {"type": "array", "items": {"type": "string"}},
                                            "start_date": {"type": "string"},
                                            "end_date": {"type": "string"},
                                        },
                                        "required": [
                                            "company", "job_title", "location", "responsibilities",
                                            "technologies", "additional_information", "start_date", "end_date",
                                        ],
                                    },
                                },
                                "years_of_experience": {"type": "number"},
                                "projects": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "additionalProperties": False,
                                        "properties": {
                                            "name": {"type": "string"},
                                            "description": {"type": "string"},
                                        },
                                        "required": ["name", "description"],
                                    },
                                },
                                "certifications": {"type": "string"},
                                "links": {"type": "object"},
                            },
                            "required": [
                                "name", "email", "phone", "skills", "education", "experience",
                                "years_of_experience", "projects", "certifications", "links",
                            ],
                        },
                    },
                },
            }
        response = _call_with_fallback(url, payload, timeout)
        response.raise_for_status()
        payload = response.json()
        message = payload["choices"][0]["message"]
        content = message.get("content") or ""
        if not content.strip():
            raise ValueError("LM Studio returned no answer content.")
        if payload["choices"][0].get("finish_reason") == "length":
            raise ValueError(
                "LM Studio truncated the JSON response; reduce resume size or increase max_tokens."
            )
    except requests.RequestException as error:
        detail = response.text[:300].strip() if response is not None else str(error)
        raise RuntimeError(f"LM Studio connection/request failed: {detail}") from error
    except (ValueError, KeyError, IndexError, TypeError) as error:
        detail = response.text[:300].strip() if response is not None else str(error)
        raise RuntimeError(f"LM Studio returned an invalid response: {detail}") from error
    try:
        return normalize_resume(_json_from_content(content))
    except ValueError as error:
        raise RuntimeError(f"LM Studio returned invalid resume JSON: {error}") from error


def parse_resume_from_image_with_lm_studio(
    image_bytes: bytes | list[bytes],
    mime_type: str = "image/jpeg",
) -> dict[str, Any]:
    """Send a resume image (or list of page images) directly to LM Studio's vision API.

    Accepts a single ``bytes`` object (JPG upload) or a ``list[bytes]`` (scanned PDF pages).
    No OCR step is involved — the LLM reads the images natively.
    """
    import base64

    pages: list[bytes] = [image_bytes] if isinstance(image_bytes, bytes) else image_bytes
    if not pages or not any(pages):
        raise ValueError("Cannot send empty image to LM Studio.")

    base_url = os.getenv("LM_STUDIO_BASE_URL", DEFAULT_BASE_URL).strip()
    url = os.getenv("LM_STUDIO_URL", "").strip()
    if not url:
        url = re.sub(r"/models/?$", "/chat/completions", base_url)
    model = os.getenv("LM_STUDIO_MODEL", DEFAULT_MODEL).strip()
    timeout = float(os.getenv("LM_STUDIO_TIMEOUT", "90"))

    schema = {
        "detected_language": "en",
        "name": "",
        "email": "",
        "phone": "",
        "skills": [{"name": "", "confidence": 0.0}],
        "education": [{"degree": "", "institution": "", "end_year": "", "grade": ""}],
        "experience": [{
            "company": "", "job_title": "", "location": "",
            "responsibilities": [], "technologies": [],
            "start_date": "", "end_date": "",
        }],
        "years_of_experience": 0,
        "projects": [{"name": "", "description": ""}],
        "certifications": "",
        "links": {},
    }
    prompt = (
        "Extract structured information from the resume shown in this image. "
        "Return ONLY one valid JSON object matching the schema below. "
        "Set detected_language to the BCP-47 code of the language the resume is written in "
        "(e.g. \"en\" for English, \"fr\" for French, \"es\" for Spanish, \"de\" for German). "
        "Do not infer employment from an objective or project. "
        "Do not put employers in education. Education must contain only real degrees/schools; "
        "use end_year only, never start_year. Preserve missing values as empty strings/lists. "
        "Ignore standalone Spring unless the resume explicitly says Spring Boot. "
        "Keep responsibilities concise: maximum 8 items per job, maximum 180 characters each. "
        "Keep technologies to the 20 most relevant items. Do not copy the entire resume into JSON.\n\n"
        f"SCHEMA:\n{json.dumps(schema, ensure_ascii=True)}"
    )

    image_content = [
        {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{base64.b64encode(page).decode()}"}}
        for page in pages
    ]
    response = None
    try:
        payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": "You are a precise resume information extraction service."},
                    {
                        "role": "user",
                        "content": [
                            *image_content,
                            {"type": "text", "text": prompt},
                        ],
                    },
                ],
                "temperature": 0,
                "max_tokens": 6000,
                "chat_template_kwargs": {"enable_thinking": False},
                "response_format": {
                    "type": "json_schema",
                    "json_schema": {
                        "name": "resume_extraction",
                        "strict": True,
                        "schema": {
                            "type": "object",
                            "additionalProperties": False,
                            "properties": {
                                "detected_language": {"type": "string"},
                                "name": {"type": "string"},
                                "email": {"type": "string"},
                                "phone": {"type": "string"},
                                "skills": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "additionalProperties": False,
                                        "properties": {
                                            "name": {"type": "string"},
                                            "confidence": {"type": "number"},
                                        },
                                        "required": ["name", "confidence"],
                                    },
                                },
                                "education": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "additionalProperties": False,
                                        "properties": {
                                            "degree": {"type": "string"},
                                            "institution": {"type": "string"},
                                            "end_year": {"type": "string"},
                                            "grade": {"type": "string"},
                                        },
                                        "required": ["degree", "institution", "end_year", "grade"],
                                    },
                                },
                                "experience": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "additionalProperties": False,
                                        "properties": {
                                            "company": {"type": "string"},
                                            "job_title": {"type": "string"},
                                            "location": {"type": "string"},
                                            "responsibilities": {"type": "array", "items": {"type": "string"}},
                                            "technologies": {"type": "array", "items": {"type": "string"}},
                                            "additional_information": {"type": "array", "items": {"type": "string"}},
                                            "start_date": {"type": "string"},
                                            "end_date": {"type": "string"},
                                        },
                                        "required": [
                                            "company", "job_title", "location", "responsibilities",
                                            "technologies", "additional_information", "start_date", "end_date",
                                        ],
                                    },
                                },
                                "years_of_experience": {"type": "number"},
                                "projects": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "additionalProperties": False,
                                        "properties": {
                                            "name": {"type": "string"},
                                            "description": {"type": "string"},
                                        },
                                        "required": ["name", "description"],
                                    },
                                },
                                "certifications": {"type": "string"},
                                "links": {"type": "object"},
                            },
                            "required": [
                                "detected_language", "name", "email", "phone", "skills", "education", "experience",
                                "years_of_experience", "projects", "certifications", "links",
                            ],
                        },
                    },
                },
            }
        response = _call_with_fallback(url, payload, timeout)
        response.raise_for_status()
        payload = response.json()
        message = payload["choices"][0]["message"]
        content = message.get("content") or ""
        if not content.strip():
            raise ValueError("LM Studio returned no answer content.")
        if payload["choices"][0].get("finish_reason") == "length":
            raise ValueError(
                "LM Studio truncated the JSON response; reduce image size or increase max_tokens."
            )
    except requests.RequestException as error:
        detail = response.text[:300].strip() if response is not None else str(error)
        raise RuntimeError(f"LM Studio connection/request failed: {detail}") from error
    except (ValueError, KeyError, IndexError, TypeError) as error:
        detail = response.text[:300].strip() if response is not None else str(error)
        raise RuntimeError(f"LM Studio returned an invalid response: {detail}") from error
    try:
        raw = _json_from_content(content)
        detected_language = raw.get("detected_language", "en") or "en"
        normalized = normalize_resume(raw)
        normalized["detected_language"] = detected_language
        return normalized
    except ValueError as error:
        raise RuntimeError(f"LM Studio returned invalid resume JSON: {error}") from error


# ---------------------------------------------------------------------------
# JD Skill Extractor
# ---------------------------------------------------------------------------

def _normalize_jd(value: dict[str, Any]) -> dict[str, Any]:
    """Validate and clean the raw LLM output for a JD analysis."""
    jd = value.get("jd") if isinstance(value.get("jd"), dict) else value

    def _importance(v: object) -> str:
        s = _string(v).upper()
        return s if s in {"HIGH", "MEDIUM", "LOW"} else "MEDIUM"

    def _category(v: object) -> str:
        s = _string(v).lower()
        return s if s in {"technical", "tool", "soft", "domain"} else "technical"

    skills = []
    for item in jd.get("skills", []):
        if not isinstance(item, dict):
            continue
        name = _string(item.get("name"))
        if not name:
            continue
        skills.append({
            "name": name,
            "normalizedName": re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_"),
            "importance": _importance(item.get("importance")),
            "category": _category(item.get("category")),
        })

    return {
        "jobTitle": _string(jd.get("jobTitle") or jd.get("job_title")),
        "experienceRequired": _string(jd.get("experienceRequired") or jd.get("experience_required")),
        "educationRequired": _string(jd.get("educationRequired") or jd.get("education_required")),
        "skills": skills,
    }


def extract_jd_skills_with_lm_studio(text: str) -> dict[str, Any]:
    """Extract required skills and job metadata from raw job description text.

    Returns a dict with jobTitle, experienceRequired, educationRequired,
    and skills (list of name / normalizedName / importance / category).
    """
    if not text.strip():
        raise ValueError("Cannot send empty job description to LM Studio.")

    base_url = os.getenv("LM_STUDIO_BASE_URL", DEFAULT_BASE_URL).strip()
    url = os.getenv("LM_STUDIO_URL", "").strip()
    if not url:
        url = re.sub(r"/models/?$", "/chat/completions", base_url)
    model = os.getenv("LM_STUDIO_MODEL", DEFAULT_MODEL).strip()
    timeout = float(os.getenv("LM_STUDIO_TIMEOUT", "90"))

    schema = {
        "jobTitle": "",
        "experienceRequired": "",
        "educationRequired": "",
        "skills": [
            {
                "name": "",
                "importance": "HIGH | MEDIUM | LOW",
                "category": "technical | tool | soft | domain",
            }
        ],
    }

    prompt = (
        "Extract structured hiring requirements from the job description below. "
        "Return ONLY one valid JSON object matching the schema. Rules:\n"
        "- jobTitle: the role being hired for (e.g. 'Backend Developer').\n"
        "- experienceRequired: total years expected (e.g. '3+ years'), empty string if not stated.\n"
        "- educationRequired: minimum degree/field if mentioned, empty string if not stated.\n"
        "- skills: every distinct skill, technology, tool, or competency mentioned.\n"
        "  - importance: HIGH if the JD says required/must/mandatory, "
        "LOW if preferred/nice-to-have/bonus, MEDIUM otherwise.\n"
        "  - category: 'technical' for languages/frameworks/databases, "
        "'tool' for specific software/platforms, "
        "'soft' for interpersonal/communication skills, "
        "'domain' for industry/business knowledge.\n"
        "Do not invent skills not present in the text. Do not duplicate skills.\n\n"
        f"SCHEMA:\n{json.dumps(schema, ensure_ascii=True)}\n\n"
        f"JOB DESCRIPTION:\n{text[:20000]}"
    )

    response = None
    try:
        payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": "You are a precise job description analysis service."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0,
                "max_tokens": 3000,
                "chat_template_kwargs": {"enable_thinking": False},
                "response_format": {
                    "type": "json_schema",
                    "json_schema": {
                        "name": "jd_extraction",
                        "strict": True,
                        "schema": {
                            "type": "object",
                            "additionalProperties": False,
                            "properties": {
                                "jobTitle": {"type": "string"},
                                "experienceRequired": {"type": "string"},
                                "educationRequired": {"type": "string"},
                                "skills": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "additionalProperties": False,
                                        "properties": {
                                            "name": {"type": "string"},
                                            "importance": {
                                                "type": "string",
                                                "enum": ["HIGH", "MEDIUM", "LOW"],
                                            },
                                            "category": {
                                                "type": "string",
                                                "enum": ["technical", "tool", "soft", "domain"],
                                            },
                                        },
                                        "required": ["name", "importance", "category"],
                                    },
                                },
                            },
                            "required": ["jobTitle", "experienceRequired", "educationRequired", "skills"],
                        },
                    },
                },
            }
        response = _call_with_fallback(url, payload, timeout)
        response.raise_for_status()
        payload = response.json()
        message = payload["choices"][0]["message"]
        content = message.get("content") or ""
        if not content.strip():
            raise ValueError("LM Studio returned no answer content.")
        if payload["choices"][0].get("finish_reason") == "length":
            raise ValueError(
                "LM Studio truncated the JSON response; reduce JD size or increase max_tokens."
            )
    except requests.RequestException as error:
        detail = response.text[:300].strip() if response is not None else str(error)
        raise RuntimeError(f"LM Studio connection/request failed: {detail}") from error
    except (ValueError, KeyError, IndexError, TypeError) as error:
        detail = response.text[:300].strip() if response is not None else str(error)
        raise RuntimeError(f"LM Studio returned an invalid response: {detail}") from error
    try:
        return _normalize_jd(_json_from_content(content))
    except ValueError as error:
        raise RuntimeError(f"LM Studio returned invalid JD JSON: {error}") from error


# ---------------------------------------------------------------------------
# Candidate–Job Matcher (Embedding-based)
# ---------------------------------------------------------------------------

_MATCH_THRESHOLD = 0.75  # cosine similarity threshold for a skill to count as matched
_IMPORTANCE_WEIGHT: dict[str, int] = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}


def _embedding_url() -> str:
    """Derive the /v1/embeddings URL from the configured LM Studio endpoint."""
    url = os.getenv("LM_STUDIO_URL", "").strip()
    if url:
        return re.sub(r"/chat/completions$", "/embeddings", url)
    base = os.getenv("LM_STUDIO_BASE_URL", DEFAULT_BASE_URL).strip()
    return re.sub(r"/models/?$", "/embeddings", base)


def _batch_embed(texts: list[str], model: str, timeout: float) -> list[list[float]] | None:
    """Batch-fetch embeddings from LM Studio.

    Only attempted when LM_STUDIO_EMBEDDING_MODEL is explicitly set in the environment.
    Returns None immediately (triggering the name-based fallback) if no embedding model
    is configured, or if the request fails for any reason.
    """
    emb_model = os.getenv("LM_STUDIO_EMBEDDING_MODEL", "").strip()
    if not emb_model:
        # No dedicated embedding model configured — skip the network call entirely.
        return None
    try:
        resp = requests.post(
            _embedding_url(),
            headers={"Content-Type": "application/json"},
            json={"model": emb_model, "input": texts},
            timeout=timeout,
        )
        resp.raise_for_status()
        items = sorted(resp.json()["data"], key=lambda x: x["index"])
        return [item["embedding"] for item in items]
    except Exception:
        return None


def _cosine(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    na = sum(x * x for x in a) ** 0.5
    nb = sum(x * x for x in b) ** 0.5
    return dot / (na * nb) if na and nb else 0.0


def _parse_min_years(exp_str: str) -> float:
    """Extract minimum years from strings like '5-10 years', '3+ years', '0-2 years'."""
    if not exp_str:
        return 0.0
    m = re.search(r"(\d+(?:\.\d+)?)", exp_str.strip())
    return float(m.group(1)) if m else 0.0


def _fallback_similarity(a: str, b: str) -> float:
    """Name-based similarity fallback when embeddings are unavailable."""
    def norm(s: str) -> str:
        return re.sub(r"[^a-z0-9]", "", s.lower())
    na, nb = norm(a), norm(b)
    if na == nb:
        return 1.0
    if na and nb and (na in nb or nb in na):
        return 0.85
    return 0.0


def _extract_resume(candidate: dict[str, Any]) -> dict[str, Any]:
    """Accept both the full parse response (with outer status/resume wrapper) and the inner resume dict."""
    if "resume" in candidate and isinstance(candidate["resume"], dict):
        return candidate["resume"]
    return candidate


def _norm_name(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")


def match_candidate_with_lm_studio(
    candidate: dict[str, Any],
    job_requirements: dict[str, Any],
) -> dict[str, Any]:
    """Score a candidate against job requirements using embedding-based skill similarity.

    Accepts both the full parse response (with outer status/language/resume wrapper)
    and the inner resume object directly.

    Scoring:
    - Experience is a hard gate — if not met, overallScore = 0.
    - Skills (85%): cosine similarity of skill embeddings, weighted by importance and candidate confidence.
    - Experience surplus (15%): proportional bonus for exceeding the minimum requirement.
    - Education: informational only — a degree mismatch never reduces the score.

    Falls back to normalised-name matching if the embeddings endpoint is unavailable.
    """
    resume = _extract_resume(candidate)
    model = os.getenv("LM_STUDIO_MODEL", DEFAULT_MODEL).strip()
    timeout = float(os.getenv("LM_STUDIO_TIMEOUT", "90"))

    # --- Education (informational only) ---
    edu_req = (job_requirements.get("educationRequired") or "").lower()
    cand_edu_text = " ".join(
        (e.get("degree") or "") for e in resume.get("education", [])
    ).lower()
    edu_met = True
    if "master" in edu_req and "master" not in cand_edu_text and "phd" not in cand_edu_text and "doctorate" not in cand_edu_text:
        edu_met = False
    elif "phd" in edu_req or "doctorate" in edu_req:
        if "phd" not in cand_edu_text and "doctorate" not in cand_edu_text:
            edu_met = False

    # --- Experience gate ---
    min_years = _parse_min_years(job_requirements.get("experienceRequired") or "")
    candidate_years = float(resume.get("years_of_experience") or 0)
    experience_met = candidate_years >= min_years

    required_skills: list[dict] = job_requirements.get("skills") or []
    candidate_skills: list[dict] = resume.get("skills") or []

    if not experience_met:
        missing = [
            {"name": s["name"], "normalizedName": _norm_name(s["name"]),
             "importance": s.get("importance", "MEDIUM").upper()}
            for s in required_skills if s.get("name")
        ]
        return {
            "overallScore": 0,
            "experienceMet": False,
            "educationMet": edu_met,
            "matchedSkills": [],
            "missingSkills": missing,
            "summary": (
                f"Candidate has {int(candidate_years)} year{'s' if candidate_years != 1 else ''} "
                f"of experience but the role requires at least {int(min_years)} years."
            ),
        }

    # --- Embedding-based skill matching ---
    req_names = [s.get("name", "") for s in required_skills]
    cand_names = [s.get("name", "") for s in candidate_skills]
    cand_confidence: dict[str, float] = {
        s.get("name", ""): max(0.0, min(1.0, float(s.get("confidence", 0.8) or 0.8)))
        for s in candidate_skills
    }

    req_embeddings: list[list[float]] | None = None
    cand_embeddings: list[list[float]] | None = None

    if req_names and cand_names:
        all_embs = _batch_embed(req_names + cand_names, model, timeout)
        if all_embs:
            req_embeddings = all_embs[: len(req_names)]
            cand_embeddings = all_embs[len(req_names) :]

    matched_skills: list[dict] = []
    missing_skills: list[dict] = []

    for i, req_skill in enumerate(required_skills):
        req_name = req_skill.get("name", "")
        importance = (req_skill.get("importance") or "MEDIUM").upper()
        if importance not in _IMPORTANCE_WEIGHT:
            importance = "MEDIUM"

        best_sim = 0.0
        best_cand_name = ""

        if req_embeddings and cand_embeddings:
            for j, cand_name in enumerate(cand_names):
                sim = _cosine(req_embeddings[i], cand_embeddings[j])
                if sim > best_sim:
                    best_sim, best_cand_name = sim, cand_name
        else:
            for cand_name in cand_names:
                sim = _fallback_similarity(req_name, cand_name)
                if sim > best_sim:
                    best_sim, best_cand_name = sim, cand_name

        if best_sim >= _MATCH_THRESHOLD and best_cand_name:
            matched_skills.append({
                "name": req_name,
                "normalizedName": _norm_name(req_name),
                "importance": importance,
                "candidateConfidence": cand_confidence.get(best_cand_name, 0.8),
                "similarityScore": round(best_sim, 3),
            })
        else:
            missing_skills.append({
                "name": req_name,
                "normalizedName": _norm_name(req_name),
                "importance": importance,
            })

    # --- Score computation ---
    total_weight = sum(_IMPORTANCE_WEIGHT.get(s.get("importance", "MEDIUM").upper(), 2) for s in required_skills)
    matched_weight = sum(
        _IMPORTANCE_WEIGHT.get(s["importance"], 2) * s["candidateConfidence"] * s["similarityScore"]
        for s in matched_skills
    )
    skills_score = (matched_weight / total_weight * 100) if total_weight > 0 else 0.0

    exp_surplus_ratio = min(1.0, (candidate_years - min_years) / max(min_years, 1)) if min_years > 0 else 1.0
    exp_score = exp_surplus_ratio * 100

    overall_score = min(100, round(0.85 * skills_score + 0.15 * exp_score))

    # --- Summary ---
    n_matched, n_total = len(matched_skills), len(required_skills)
    missing_high = [s["name"] for s in missing_skills if s["importance"] == "HIGH"]

    if n_matched == n_total:
        summary = f"Excellent match: all {n_total} required skills met with {int(candidate_years)} years of experience."
    elif missing_high:
        listed = ", ".join(missing_high[:3]) + ("..." if len(missing_high) > 3 else "")
        summary = f"{n_matched}/{n_total} required skills matched; missing critical skills: {listed}."
    elif missing_skills:
        listed = ", ".join(s["name"] for s in missing_skills[:3]) + ("..." if len(missing_skills) > 3 else "")
        summary = f"{n_matched}/{n_total} required skills matched; missing: {listed}."
    else:
        summary = f"{n_matched}/{n_total} required skills matched with {int(candidate_years)} years of experience."

    return {
        "overallScore": overall_score,
        "experienceMet": True,
        "educationMet": edu_met,
        "matchedSkills": matched_skills,
        "missingSkills": missing_skills,
        "summary": summary,
    }


# ---------------------------------------------------------------------------
# Interview Question Generator
# ---------------------------------------------------------------------------

def generate_interview_questions_with_lm_studio(jd_analysis: dict[str, Any]) -> list[str]:
    """Generate at least 10 interview questions for a job role using the LLM.

    ``jd_analysis`` is the full response from ``extract_jd_skills_with_lm_studio``.
    Returns a plain list of question strings — the caller handles numbering/formatting.
    """
    base_url = os.getenv("LM_STUDIO_BASE_URL", DEFAULT_BASE_URL).strip()
    url = os.getenv("LM_STUDIO_URL", "").strip()
    if not url:
        url = re.sub(r"/models/?$", "/chat/completions", base_url)
    model = os.getenv("LM_STUDIO_MODEL", DEFAULT_MODEL).strip()
    timeout = float(os.getenv("LM_STUDIO_TIMEOUT", "120"))

    job_title = _string(jd_analysis.get("jobTitle")) or "the role"
    exp_required = _string(jd_analysis.get("experienceRequired"))
    edu_required = _string(jd_analysis.get("educationRequired"))

    # Build a concise skill list for the prompt, prioritising HIGH importance
    skills = jd_analysis.get("skills") or []
    high_skills   = [s["name"] for s in skills if s.get("importance") == "HIGH"  and s.get("name")]
    medium_skills = [s["name"] for s in skills if s.get("importance") == "MEDIUM" and s.get("name")]
    low_skills    = [s["name"] for s in skills if s.get("importance") == "LOW"    and s.get("name")]

    skill_lines = []
    if high_skills:
        skill_lines.append(f"Required (must-have): {', '.join(high_skills)}")
    if medium_skills:
        skill_lines.append(f"Important: {', '.join(medium_skills)}")
    if low_skills:
        skill_lines.append(f"Preferred: {', '.join(low_skills)}")
    skill_block = "\n".join(skill_lines) if skill_lines else "No specific skills listed."

    context_lines = [f"Job Title: {job_title}"]
    if exp_required:
        context_lines.append(f"Experience Required: {exp_required}")
    if edu_required:
        context_lines.append(f"Education Required: {edu_required}")
    context_lines.append(f"Skills:\n{skill_block}")
    context = "\n".join(context_lines)

    prompt = (
        f"You are an expert technical interviewer. Generate exactly 12 interview questions for a candidate "
        f"applying for the following role.\n\n"
        f"{context}\n\n"
        f"Requirements for the questions:\n"
        f"- At least 6 questions must test technical depth on the required skills listed above.\n"
        f"- At least 2 questions must be scenario/problem-solving based.\n"
        f"- At least 2 questions must assess past experience and behaviour.\n"
        f"- Questions must be specific to this role — no generic filler questions.\n"
        f"- Each question must be a complete, clear sentence ending with a question mark.\n"
        f"- Return ONLY the questions as a JSON array of strings. No preamble, no numbering, no extra text."
    )

    response = None
    try:
        payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": "You are a precise technical interview question generator."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.4,   # slight creativity for varied questions
                "max_tokens": 2000,
                "chat_template_kwargs": {"enable_thinking": False},
                "response_format": {
                    "type": "json_schema",
                    "json_schema": {
                        "name": "interview_questions",
                        "strict": True,
                        "schema": {
                            "type": "object",
                            "additionalProperties": False,
                            "properties": {
                                "questions": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                },
                            },
                            "required": ["questions"],
                        },
                    },
                },
            }
        response = _call_with_fallback(url, payload, timeout)
        response.raise_for_status()
        payload = response.json()
        content = (payload["choices"][0]["message"].get("content") or "").strip()
        if not content:
            raise ValueError("LM Studio returned no content.")
        if payload["choices"][0].get("finish_reason") == "length":
            raise ValueError("LM Studio truncated the response; increase max_tokens.")
    except requests.RequestException as error:
        detail = response.text[:300].strip() if response is not None else str(error)
        raise RuntimeError(f"LM Studio connection/request failed: {detail}") from error
    except (ValueError, KeyError, IndexError, TypeError) as error:
        detail = response.text[:300].strip() if response is not None else str(error)
        raise RuntimeError(f"LM Studio returned an invalid response: {detail}") from error

    try:
        raw = _json_from_content(content)
        questions = [str(q).strip() for q in raw.get("questions", []) if str(q).strip()]
        if len(questions) < 5:
            raise ValueError(f"Too few questions returned ({len(questions)}).")
        return questions
    except ValueError as error:
        raise RuntimeError(f"LM Studio returned invalid question JSON: {error}") from error
