-- DISCLAIMER: This script is created by AI (Github Copilot).

BEGIN;

DO $$
DECLARE
  hub_go_id UUID;
  snippet_id UUID;
  anna_id UUID;
  ben_id UUID;
  cara_id UUID;
  old_guard_id UUID;
  race_id UUID;
BEGIN
  INSERT INTO hubs (slug, language, title, is_ranked, is_active)
  VALUES ('go', 'go', 'Go Hub', TRUE, TRUE)
  ON CONFLICT (slug) DO UPDATE SET is_active = TRUE;

  SELECT id INTO hub_go_id FROM hubs WHERE slug = 'go' LIMIT 1;

  SELECT id
    INTO snippet_id
  FROM snippets
  WHERE language = 'go' AND source_label = 'dev-movement-seed'
  ORDER BY created_at DESC
  LIMIT 1;

  IF snippet_id IS NULL THEN
    INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
    VALUES (
      'go',
      'Movement Seed Snippet',
      2,
      E'package main\n\nimport "fmt"\n\nfunc main() {\n  fmt.Println("seed")\n}',
      'dev-movement-seed',
      TRUE
    )
    RETURNING id INTO snippet_id;
  END IF;

  INSERT INTO users (email, password_hash)
  VALUES
    ('move.anna@race.local', 'dev-seed'),
    ('move.ben@race.local', 'dev-seed'),
    ('move.cara@race.local', 'dev-seed'),
    ('move.oldguard@race.local', 'dev-seed')
  ON CONFLICT (email) DO NOTHING;

  SELECT id INTO anna_id FROM users WHERE email = 'move.anna@race.local' LIMIT 1;
  SELECT id INTO ben_id FROM users WHERE email = 'move.ben@race.local' LIMIT 1;
  SELECT id INTO cara_id FROM users WHERE email = 'move.cara@race.local' LIMIT 1;
  SELECT id INTO old_guard_id FROM users WHERE email = 'move.oldguard@race.local' LIMIT 1;

  INSERT INTO profiles (user_id, username)
  VALUES
    (anna_id, 'move_anna'),
    (ben_id, 'move_ben'),
    (cara_id, 'move_cara'),
    (old_guard_id, 'move_oldguard')
  ON CONFLICT (user_id) DO UPDATE
  SET username = EXCLUDED.username,
      updated_at = NOW();

  DELETE FROM races WHERE external_race_id LIKE 'dev-move-%';

  INSERT INTO races (hub_id, snippet_id, status, started_at, ended_at, created_at, external_race_id, external_room_id, finish_reason)
  VALUES (hub_go_id, snippet_id, 'finished', NOW() - INTERVAL '10 days' + INTERVAL '4 minutes', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', 'dev-move-prev-1', 'dev-room-prev', 'completed')
  RETURNING id INTO race_id;
  INSERT INTO race_participants (race_id, user_id, final_position, completion_percent, gross_wpm, net_wpm, accuracy, errors_count, corrections_count, finished_at)
  VALUES
    (race_id, old_guard_id, 1, 100, 108, 102, 98.6, 1, 0, NOW() - INTERVAL '10 days'),
    (race_id, anna_id, 2, 100, 99, 94, 97.9, 2, 1, NOW() - INTERVAL '10 days'),
    (race_id, ben_id, 3, 100, 95, 90, 97.4, 3, 1, NOW() - INTERVAL '10 days'),
    (race_id, cara_id, 4, 100, 86, 82, 96.9, 4, 2, NOW() - INTERVAL '10 days');

  INSERT INTO races (hub_id, snippet_id, status, started_at, ended_at, created_at, external_race_id, external_room_id, finish_reason)
  VALUES (hub_go_id, snippet_id, 'finished', NOW() - INTERVAL '9 days' + INTERVAL '4 minutes', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days', 'dev-move-prev-2', 'dev-room-prev', 'completed')
  RETURNING id INTO race_id;
  INSERT INTO race_participants (race_id, user_id, final_position, completion_percent, gross_wpm, net_wpm, accuracy, errors_count, corrections_count, finished_at)
  VALUES
    (race_id, old_guard_id, 1, 100, 110, 104, 98.8, 1, 0, NOW() - INTERVAL '9 days'),
    (race_id, anna_id, 2, 100, 101, 95, 97.8, 2, 1, NOW() - INTERVAL '9 days'),
    (race_id, ben_id, 3, 100, 96, 89, 97.1, 3, 1, NOW() - INTERVAL '9 days'),
    (race_id, cara_id, 4, 100, 84, 79, 96.3, 4, 2, NOW() - INTERVAL '9 days');

  INSERT INTO races (hub_id, snippet_id, status, started_at, ended_at, created_at, external_race_id, external_room_id, finish_reason)
  VALUES (hub_go_id, snippet_id, 'finished', NOW() - INTERVAL '8 days' + INTERVAL '4 minutes', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', 'dev-move-prev-3', 'dev-room-prev', 'completed')
  RETURNING id INTO race_id;
  INSERT INTO race_participants (race_id, user_id, final_position, completion_percent, gross_wpm, net_wpm, accuracy, errors_count, corrections_count, finished_at)
  VALUES
    (race_id, anna_id, 1, 100, 104, 99, 98.3, 1, 0, NOW() - INTERVAL '8 days'),
    (race_id, old_guard_id, 2, 100, 103, 98, 98.1, 1, 0, NOW() - INTERVAL '8 days'),
    (race_id, ben_id, 3, 100, 97, 91, 97.0, 2, 1, NOW() - INTERVAL '8 days'),
    (race_id, cara_id, 4, 100, 85, 80, 96.2, 4, 2, NOW() - INTERVAL '8 days');

  INSERT INTO races (hub_id, snippet_id, status, started_at, ended_at, created_at, external_race_id, external_room_id, finish_reason)
  VALUES (hub_go_id, snippet_id, 'finished', NOW() - INTERVAL '3 days' + INTERVAL '4 minutes', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 'dev-move-now-1', 'dev-room-now', 'completed')
  RETURNING id INTO race_id;
  INSERT INTO race_participants (race_id, user_id, final_position, completion_percent, gross_wpm, net_wpm, accuracy, errors_count, corrections_count, finished_at)
  VALUES
    (race_id, anna_id, 1, 100, 113, 108, 99.1, 1, 0, NOW() - INTERVAL '3 days'),
    (race_id, ben_id, 2, 100, 107, 101, 98.2, 1, 0, NOW() - INTERVAL '3 days'),
    (race_id, old_guard_id, 3, 100, 102, 96, 97.4, 2, 1, NOW() - INTERVAL '3 days'),
    (race_id, cara_id, 4, 100, 90, 84, 96.5, 3, 1, NOW() - INTERVAL '3 days');

  INSERT INTO races (hub_id, snippet_id, status, started_at, ended_at, created_at, external_race_id, external_room_id, finish_reason)
  VALUES (hub_go_id, snippet_id, 'finished', NOW() - INTERVAL '2 days' + INTERVAL '4 minutes', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 'dev-move-now-2', 'dev-room-now', 'completed')
  RETURNING id INTO race_id;
  INSERT INTO race_participants (race_id, user_id, final_position, completion_percent, gross_wpm, net_wpm, accuracy, errors_count, corrections_count, finished_at)
  VALUES
    (race_id, ben_id, 1, 100, 111, 105, 99.0, 1, 0, NOW() - INTERVAL '2 days'),
    (race_id, anna_id, 2, 100, 110, 104, 98.7, 1, 0, NOW() - INTERVAL '2 days'),
    (race_id, old_guard_id, 3, 100, 101, 95, 97.2, 2, 1, NOW() - INTERVAL '2 days'),
    (race_id, cara_id, 4, 100, 89, 83, 96.4, 3, 1, NOW() - INTERVAL '2 days');

  INSERT INTO races (hub_id, snippet_id, status, started_at, ended_at, created_at, external_race_id, external_room_id, finish_reason)
  VALUES (hub_go_id, snippet_id, 'finished', NOW() - INTERVAL '1 day' + INTERVAL '4 minutes', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 'dev-move-now-3', 'dev-room-now', 'completed')
  RETURNING id INTO race_id;
  INSERT INTO race_participants (race_id, user_id, final_position, completion_percent, gross_wpm, net_wpm, accuracy, errors_count, corrections_count, finished_at)
  VALUES
    (race_id, anna_id, 1, 100, 115, 110, 99.2, 1, 0, NOW() - INTERVAL '1 day'),
    (race_id, ben_id, 2, 100, 109, 103, 98.4, 1, 0, NOW() - INTERVAL '1 day'),
    (race_id, old_guard_id, 3, 100, 100, 94, 97.0, 2, 1, NOW() - INTERVAL '1 day'),
    (race_id, cara_id, 4, 100, 91, 85, 96.8, 3, 1, NOW() - INTERVAL '1 day');
END $$;

COMMIT;
