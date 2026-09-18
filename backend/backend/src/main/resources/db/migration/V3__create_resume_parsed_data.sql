CREATE TABLE resume_parsed_data (
                                    id BIGSERIAL PRIMARY KEY,

                                    resume_id BIGINT NOT NULL UNIQUE,

                                    parsed_json JSONB NOT NULL,

                                    parser_version VARCHAR(50),

                                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                    CONSTRAINT fk_resume_parsed_data_resume
                                        FOREIGN KEY (resume_id)
                                            REFERENCES resumes(id)
                                            ON DELETE CASCADE
);

CREATE INDEX idx_resume_parsed_data_resume_id
    ON resume_parsed_data(resume_id);