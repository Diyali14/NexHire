CREATE TABLE IF NOT EXISTS resume_parsed_data (
    id BIGSERIAL PRIMARY KEY,
    resume_id BIGINT NOT NULL UNIQUE,
    parsed_json JSONB NOT NULL,
    candidate_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    years_of_experience INT,
    language VARCHAR(50),
    certifications TEXT,
    parser_version VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_resume_parsed_data_resume_id UNIQUE (resume_id),
    CONSTRAINT fk_resume_parsed_data_resume
        FOREIGN KEY (resume_id)
            REFERENCES resumes(id)
            ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_resume_parsed_data_resume_id ON resume_parsed_data(resume_id);