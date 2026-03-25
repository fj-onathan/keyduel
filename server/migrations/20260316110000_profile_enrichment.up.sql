ALTER TABLE profiles
    ADD COLUMN display_name TEXT,
    ADD COLUMN headline TEXT,
    ADD COLUMN bio TEXT,
    ADD COLUMN website_url TEXT,
    ADD COLUMN location TEXT,
    ADD COLUMN skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN curriculum JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX idx_profiles_display_name ON profiles(display_name);
