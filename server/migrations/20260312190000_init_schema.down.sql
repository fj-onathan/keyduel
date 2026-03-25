DROP INDEX IF EXISTS idx_leaderboard_user_id;
DROP INDEX IF EXISTS idx_leaderboard_hub_metric_value;
DROP INDEX IF EXISTS idx_race_participants_user_id;
DROP INDEX IF EXISTS idx_race_participants_race_id;
DROP INDEX IF EXISTS idx_races_hub_created_at;
DROP INDEX IF EXISTS idx_snippets_language_active;
DROP INDEX IF EXISTS idx_hubs_language_active;

DROP TABLE IF EXISTS leaderboard_entries;
DROP TABLE IF EXISTS seasons;
DROP TABLE IF EXISTS race_participants;
DROP TABLE IF EXISTS races;
DROP TABLE IF EXISTS snippets;
DROP TABLE IF EXISTS hubs;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;

DROP EXTENSION IF EXISTS pgcrypto;
