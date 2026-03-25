DROP INDEX IF EXISTS idx_profiles_display_name;

ALTER TABLE profiles
    DROP COLUMN IF EXISTS curriculum,
    DROP COLUMN IF EXISTS skills,
    DROP COLUMN IF EXISTS location,
    DROP COLUMN IF EXISTS website_url,
    DROP COLUMN IF EXISTS bio,
    DROP COLUMN IF EXISTS headline,
    DROP COLUMN IF EXISTS display_name;
