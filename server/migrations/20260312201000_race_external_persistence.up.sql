ALTER TABLE races
    ADD COLUMN external_race_id TEXT,
    ADD COLUMN external_room_id TEXT,
    ADD COLUMN finish_reason TEXT;

CREATE UNIQUE INDEX idx_races_external_race_id_unique
    ON races(external_race_id)
    WHERE external_race_id IS NOT NULL;
