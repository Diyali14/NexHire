CREATE TABLE IF NOT EXISTS interview_questions (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT,
    candidate_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    raw_response JSONB NOT NULL,
    total_questions INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_interview_questions_candidate
        FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_interview_questions_job
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_interview_questions_candidate_job ON interview_questions(candidate_id, job_id);

CREATE TABLE IF NOT EXISTS skill_gap_results (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT,
    candidate_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    resume_id BIGINT NOT NULL,
    raw_response JSONB NOT NULL,
    has_gap BOOLEAN,
    experience_met BOOLEAN,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_skill_gap_candidate
        FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_skill_gap_job
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_skill_gap_resume
        FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_skill_gap_candidate_job ON skill_gap_results(candidate_id, job_id);
