CREATE TABLE job_applications (

                                  id BIGSERIAL PRIMARY KEY,

                                  job_id BIGINT NOT NULL,

                                  candidate_id BIGINT NOT NULL,

                                  resume_id BIGINT NOT NULL,

                                  status VARCHAR(30) NOT NULL
                                      DEFAULT 'MATCHING_PENDING',

                                  overall_score INTEGER,

                                  matcher_result JSONB,

                                  matcher_version VARCHAR(100),

                                  error_message TEXT,

                                  created_at TIMESTAMP NOT NULL
                                      DEFAULT CURRENT_TIMESTAMP,

                                  updated_at TIMESTAMP NOT NULL
                                      DEFAULT CURRENT_TIMESTAMP,

                                  CONSTRAINT uk_job_application_job_candidate
                                      UNIQUE (job_id, candidate_id),

                                  CONSTRAINT fk_job_application_job
                                      FOREIGN KEY (job_id)
                                          REFERENCES jobs(id)
                                          ON DELETE CASCADE,

                                  CONSTRAINT fk_job_application_candidate
                                      FOREIGN KEY (candidate_id)
                                          REFERENCES users(id)
                                          ON DELETE CASCADE,

                                  CONSTRAINT fk_job_application_resume
                                      FOREIGN KEY (resume_id)
                                          REFERENCES resumes(id)
                                          ON DELETE CASCADE
);

CREATE INDEX idx_job_applications_job_id
    ON job_applications(job_id);

CREATE INDEX idx_job_applications_candidate_id
    ON job_applications(candidate_id);

CREATE INDEX idx_job_applications_job_score
    ON job_applications(job_id, overall_score DESC);