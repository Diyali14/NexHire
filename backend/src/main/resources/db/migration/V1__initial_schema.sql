CREATE TABLE IF NOT EXISTS roles (
                       id BIGSERIAL PRIMARY KEY,
                       name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
                       id BIGSERIAL PRIMARY KEY,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       first_name VARCHAR(100) NOT NULL,
                       last_name VARCHAR(100),
                       phone VARCHAR(30),
                       status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
                            user_id BIGINT NOT NULL,
                            role_id BIGINT NOT NULL,

                            PRIMARY KEY (user_id, role_id),

                            CONSTRAINT fk_user_roles_user
                                FOREIGN KEY (user_id)
                                    REFERENCES users(id)
                                    ON DELETE CASCADE,

                            CONSTRAINT fk_user_roles_role
                                FOREIGN KEY (role_id)
                                    REFERENCES roles(id)
                                    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS candidate_profiles (
                                    id BIGSERIAL PRIMARY KEY,
                                    user_id BIGINT NOT NULL UNIQUE,
                                    linkedin_url VARCHAR(500),
                                    github_url VARCHAR(500),
                                    bio TEXT,
                                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                    CONSTRAINT fk_candidate_user
                                        FOREIGN KEY (user_id)
                                            REFERENCES users(id)
                                            ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recruiter_profiles (
                                    id BIGSERIAL PRIMARY KEY,
                                    user_id BIGINT NOT NULL UNIQUE,
                                    company_name VARCHAR(255),
                                    designation VARCHAR(255),
                                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                    CONSTRAINT fk_recruiter_user
                                        FOREIGN KEY (user_id)
                                            REFERENCES users(id)
                                            ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);

CREATE INDEX IF NOT EXISTS idx_candidate_profiles_user
    ON candidate_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_recruiter_profiles_user
    ON recruiter_profiles(user_id);

INSERT INTO roles (name)
VALUES
    ('CANDIDATE'),
    ('RECRUITER'),
    ('ADMIN')
ON CONFLICT (name) DO NOTHING;