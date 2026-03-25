-- Remove GitHub OAuth columns from users table
DROP INDEX IF EXISTS idx_users_github_id;

ALTER TABLE users
    DROP COLUMN IF EXISTS github_id,
    DROP COLUMN IF EXISTS auth_provider;

-- Restore password_hash as NOT NULL (set empty string for any NULLs first)
UPDATE users SET password_hash = '' WHERE password_hash IS NULL;
ALTER TABLE users
    ALTER COLUMN password_hash SET NOT NULL;
