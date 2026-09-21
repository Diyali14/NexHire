CREATE TABLE IF NOT EXISTS jobs (
                      id BIGSERIAL PRIMARY KEY,

                      recruiter_id BIGINT NOT NULL,

                      job_title VARCHAR(255) NOT NULL,

                      job_description TEXT NOT NULL,

                      storage_object_name VARCHAR(500),

                      storage_url VARCHAR(2000),

                      processing_status VARCHAR(20) NOT NULL DEFAULT 'STORED',

                      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                      CONSTRAINT fk_job_recruiter
                          FOREIGN KEY (recruiter_id)
                              REFERENCES users(id)
                              ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id
    ON jobs(recruiter_id);

CREATE INDEX IF NOT EXISTS idx_jobs_processing_status
    ON jobs(processing_status);