CREATE TABLE IF NOT EXISTS job_parsed_data (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL UNIQUE,
    parsed_json JSONB NOT NULL,
    parser_version VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_job_parsed_data_job_id UNIQUE (job_id),
    CONSTRAINT fk_job_parsed_data_job
        FOREIGN KEY (job_id)
            REFERENCES jobs(id)
            ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_job_parsed_data_job_id ON job_parsed_data(job_id);
