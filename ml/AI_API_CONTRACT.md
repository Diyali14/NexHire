# AI Service Contract

Base path: `/ai/v1`. This FastAPI service is internal-only. Spring Boot calls it with standardized resume/JD text and owns authentication, authorization, files, PostgreSQL, and application records.

For deployment, set `AI_SERVICE_API_KEY` and have Spring Boot send the same value in `X-AI-Service-Key` on every `/ai/v1` request. Leave it unset only for local development. Use private networking and HTTPS in deployment.

| Endpoint | Purpose |
|---|---|
| `POST /parse-resume` | Structured, language-aware resume JSON with confidence values. Accepts `resume_text` or base64 file content plus `document_type` (`pdf`, `docx`, `txt`). |
| `POST /parse-resume-file` | Multipart PDF/DOCX upload for Swagger/manual testing. Uses Unstructured when configured and local extraction as fallback. |
| `POST /analyze-jd` | Normalized required skills and importance. |
| `POST /generate-embedding` | Embedding with model metadata and dimension. |
| `POST /match` | Component scores, skills, evidence, explanation, and model version. |
| `POST /rank` | Scores and sorts up to 100 candidates for one job description. |
| `POST /chat` | Answers a recruiter question grounded in one resume/JD analysis. |
| `POST /explain-match` | Grounded explanation and recommendation. |
| `POST /recommend` | Skill-gap recommendations. |
| `POST /interview` | Role- and resume-grounded interview questions. |

Use `/docs` for OpenAPI request and response examples.

`/parse-resume` returns structured `resume.name`, contact fields, normalized
skills, experience entries (`company`, `job_title`, `location`, and
`responsibilities`), and education entries (`degree`, `institution`, and
`location`). Missing skills indicate only that a skill was not detected in the
supplied text.

Structured resume extraction uses the OpenAI-compatible LM Studio endpoint
configured with `LM_STUDIO_URL` and `LM_STUDIO_MODEL`. The service first
extracts document text locally, sends that text to LM Studio, validates the
returned JSON, and uses the deterministic parser if LM Studio is unavailable.
Unstructured Transform API is an optional legacy text/OCR provider and is only
used when `UNSTRUCTURED_ENABLED=true`.

Stable response schemas for backend integration are in `ml/schemas/`. Treat an incompatible schema change as a versioned API change.
