# Spring Boot Integration Guide

The AI service is an internal dependency, not a browser-facing API. Configure its base URL as `AI_SERVICE_URL`, for example `http://localhost:8000`, and keep `AI_SERVICE_API_KEY` in the backend secret store. The backend adds `X-AI-Service-Key` when calling `/ai/v1/*`.

## Integration sequence

1. Resume upload stores the original file, sets processing status to `PROCESSING`, and sends extracted text or base64 file content to `POST /ai/v1/parse-resume`.
2. Persist returned language, parser version, sections, skills, confidence values, and warnings. Set `COMPLETED`, `PARTIAL`, or `FAILED`.
3. Job creation sends title/description to `POST /ai/v1/analyze-jd`, then persists normalized skills and importance.
4. Application creation sends the immutable resume text plus job description to `POST /ai/v1/match`. Persist component scores, evidence, model version, matched skills, and missing skills with that application.
5. Recruiter ranking sorts persisted results after confirming job ownership.

## Calls

| Backend event | AI endpoint | Required data |
|---|---|---|
| Resume processing | `POST /ai/v1/parse-resume` | `resume_text` or `file_base64`, `document_type` |
| Job creation/update | `POST /ai/v1/analyze-jd` | `title`, `description` |
| Application scoring | `POST /ai/v1/match` | `resume_id`, `job_id`, `resume_text`, `job_description` |
| Candidate support UI | `/explain-match`, `/recommend`, `/interview` | Match result or resume/JD text |

## Failure behavior

Treat HTTP 422 as an invalid AI input and save a safe user-facing error. Treat timeouts and 5xx responses as retryable processing failures; do not create a fabricated score. Persist every AI model/parser version with its result.

## Boundary rule

Never expose `/ai/v1` to the browser. Candidate/recruiter JWTs are only for Spring Boot `/api/v1` endpoints. Python does not read or write the backend database.
