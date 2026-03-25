DROP INDEX IF EXISTS idx_races_external_race_id_unique;

ALTER TABLE races
    DROP COLUMN IF EXISTS finish_reason,
    DROP COLUMN IF EXISTS external_room_id,
    DROP COLUMN IF EXISTS external_race_id;
