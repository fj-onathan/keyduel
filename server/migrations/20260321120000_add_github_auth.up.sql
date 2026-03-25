-- Add GitHub OAuth support to users table
ALTER TABLE users
    ADD COLUMN github_id BIGINT UNIQUE,
    ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'local';

-- Make password_hash nullable (GitHub users don't have passwords)
ALTER TABLE users
    ALTER COLUMN password_hash DROP NOT NULL;

-- Index for fast GitHub ID lookups during OAuth callback
CREATE INDEX idx_users_github_id ON users(github_id) WHERE github_id IS NOT NULL;
