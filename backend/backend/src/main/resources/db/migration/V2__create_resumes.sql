CREATE TABLE IF NOT EXISTS resumes (
                         id BIGSERIAL PRIMARY KEY,

                         candidate_id BIGINT NOT NULL,

                         original_file_name VARCHAR(255) NOT NULL,

                         storage_object_name VARCHAR(500),

                         storage_url VARCHAR(2000),

                         file_type VARCHAR(20) NOT NULL,

                         file_size BIGINT NOT NULL,

                         file_hash VARCHAR(64),

                         processing_status VARCHAR(20) NOT NULL DEFAULT 'UPLOADED',

                         created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                         updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                         CONSTRAINT fk_resume_candidate
                             FOREIGN KEY (candidate_id)
                                 REFERENCES users(id)
                                 ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_resumes_candidate_id
    ON resumes(candidate_id);

CREATE INDEX IF NOT EXISTS idx_resumes_processing_status
    ON resumes(processing_status);