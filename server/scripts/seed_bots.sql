-- DISCLAIMER: This script is created by AI (Github Copilot).

-- seed_bots.sql
-- Idempotent seed file for bot users, profiles, and historical race data.
-- Populates leaderboards, hubs, profiles, and platform stats with realistic activity.
-- Prerequisites: run migrations and seed_snippets.sql first.
-- Run with: make seed-bots
--
-- Creates:
--   - 75 bot users with realistic profiles (bell curve WPM distribution)
--   - ~2500 historical races spread across the last 90 days
--   - Race participants with varied WPM, accuracy, positions
--   - Activity distributed across 10 popular hubs
--
-- Safe to re-run: uses ON CONFLICT and checks for existing bot-seed data.

BEGIN;

-- ============================================================================
-- STEP 1: Create 75 bot users + profiles
-- ============================================================================

DO $$
DECLARE
  bot RECORD;
  v_user_id UUID;
BEGIN

  -- Define all 75 bot identities as a temporary relation.
  -- Tier: B=beginner, I=intermediate, A=advanced, E=elite
  -- base_wpm and base_accuracy are the center of each bot's performance range.
  FOR bot IN
    SELECT * FROM (VALUES
      -- === BEGINNERS (15 bots, 30-60 WPM) ===
      ('newbie_alex',     'Alex Chen',        'US', 'B', 38,  94.2),
      ('first_steps_mia', 'Mia Thompson',     'GB', 'B', 42,  93.8),
      ('slow_coder_raj',  'Raj Patel',        'IN', 'B', 35,  93.5),
      ('learning_lua',    'Luna Martinez',     'MX', 'B', 48,  94.5),
      ('keysmash_finn',   'Finn Olsen',        'NO', 'B', 44,  94.0),
      ('baby_dev',        'Sofia Rossi',       'IT', 'B', 40,  93.7),
      ('casual_coder',    'Yuki Tanaka',       'JP', 'B', 52,  95.0),
      ('hunt_and_peck',   'Liam Murphy',       'IE', 'B', 33,  93.2),
      ('newb_typer',      'Aisha Khan',        'PK', 'B', 46,  94.3),
      ('starter_pack',    'Oscar Lindqvist',   'SE', 'B', 50,  94.8),
      ('hello_world',     'Priya Sharma',      'IN', 'B', 37,  93.6),
      ('one_finger',      'Tom Baker',         'AU', 'B', 31,  93.0),
      ('code_curious',    'Emma Dubois',       'FR', 'B', 55,  95.2),
      ('fresh_start',     'Miguel Santos',     'BR', 'B', 43,  94.1),
      ('tiny_steps',      'Noor Al-Hassan',    'AE', 'B', 47,  94.4),

      -- === INTERMEDIATE (30 bots, 60-100 WPM) ===
      ('steady_sarah',    'Sarah Kim',         'KR', 'I', 72,  96.5),
      ('daily_grind',     'James Wilson',      'US', 'I', 78,  96.8),
      ('code_monkey',     'Anastasia Volkov',  'RU', 'I', 65,  95.8),
      ('rhythm_typer',    'Carlos Herrera',     'ES', 'I', 84,  97.1),
      ('midrange_dev',    'Hannah Schmidt',    'DE', 'I', 70,  96.3),
      ('console_kid',     'Leo Nakamura',      'JP', 'I', 88,  97.4),
      ('semicolon_sam',   'Sam O''Brien',      'IE', 'I', 76,  96.7),
      ('indent_master',   'Fatima Al-Rashid',  'SA', 'I', 68,  96.0),
      ('tab_warrior',     'Erik Johansson',    'SE', 'I', 82,  97.0),
      ('bracket_queen',   'Mei-Lin Chang',     'TW', 'I', 90,  97.5),
      ('loop_lord',       'Daniel Costa',      'PT', 'I', 74,  96.6),
      ('func_fan',        'Olga Kowalski',     'PL', 'I', 67,  95.9),
      ('debug_daily',     'Arjun Nair',        'IN', 'I', 86,  97.2),
      ('stack_flow',      'Claire Fontaine',   'FR', 'I', 80,  96.9),
      ('git_push',        'Mateo Alvarez',     'AR', 'I', 71,  96.4),
      ('pipe_dream',      'Ingrid Berg',       'NO', 'I', 92,  97.6),
      ('vim_casual',      'Tao Zhang',         'CN', 'I', 63,  95.6),
      ('refactor_rick',   'Rick van Dijk',     'NL', 'I', 85,  97.2),
      ('merge_maven',     'Chloe Martin',      'CA', 'I', 77,  96.7),
      ('deploy_dan',      'Dan Eriksson',      'FI', 'I', 69,  96.1),
      ('null_check',      'Amara Okafor',      'NG', 'I', 94,  97.8),
      ('type_safe',       'Ivan Petrov',       'BG', 'I', 62,  95.5),
      ('async_await',     'Lina Johansson',    'SE', 'I', 83,  97.0),
      ('map_reduce',      'Pavel Novak',       'CZ', 'I', 75,  96.6),
      ('try_catch',       'Rosa Colombo',      'IT', 'I', 87,  97.3),
      ('clean_code',      'Ben Harper',        'AU', 'I', 79,  96.8),
      ('lint_first',      'Yara Hassan',       'EG', 'I', 66,  95.7),
      ('cargo_run',       'Felix Weber',       'DE', 'I', 91,  97.5),
      ('npm_install',     'Ava Williams',      'NZ', 'I', 73,  96.5),
      ('go_routine',      'Sven Andersen',     'DK', 'I', 81,  96.9),

      -- === ADVANCED (20 bots, 100-140 WPM) ===
      ('swift_sarah',     'Sarah Blake',       'US', 'A', 112, 98.1),
      ('rustacean_42',    'Alex Krueger',      'DE', 'A', 125, 98.5),
      ('pycraft_luke',    'Luke Anderson',     'CA', 'A', 108, 97.9),
      ('gopher_nina',     'Nina Ivanova',      'UA', 'A', 118, 98.3),
      ('ts_wizard',       'Omar Farouk',       'EG', 'A', 132, 98.7),
      ('codeflow_max',    'Max Lindgren',      'SE', 'A', 105, 97.8),
      ('algo_queen',      'Priya Menon',       'IN', 'A', 128, 98.6),
      ('kernel_kai',      'Kai Tanaka',        'JP', 'A', 115, 98.2),
      ('blazing_keys',    'Elena Sokolova',    'RU', 'A', 135, 98.8),
      ('turbo_type',      'Marco Bianchi',     'IT', 'A', 110, 98.0),
      ('hot_reload',      'Zara Nilsson',      'SE', 'A', 122, 98.4),
      ('zero_alloc',      'David Park',        'KR', 'A', 138, 98.9),
      ('mono_repo',       'Julia Ferreira',    'BR', 'A', 103, 97.7),
      ('trait_impl',      'Andrei Popescu',    'RO', 'A', 120, 98.3),
      ('pattern_match',   'Sophie Laurent',    'FR', 'A', 130, 98.7),
      ('type_theory',     'Henrik Dahl',       'DK', 'A', 107, 97.9),
      ('wasm_dev',        'Lena Hoffman',      'AT', 'A', 116, 98.2),
      ('edge_case',       'Chris Nguyen',      'VN', 'A', 126, 98.5),
      ('perf_guru',       'Marta Kowalczyk',   'PL', 'A', 133, 98.8),
      ('ship_it',         'Ravi Krishnan',     'IN', 'A', 109, 98.0),

      -- === ELITE (10 bots, 140-170 WPM) ===
      ('lightning_liz',   'Liz Hartmann',      'DE', 'E', 158, 99.1),
      ('quantum_keys',    'Kenji Yamamoto',    'JP', 'E', 165, 99.3),
      ('fiber_optic',     'Anna Stromberg',    'SE', 'E', 148, 98.9),
      ('mach_speed',      'Viktor Kovalenko',  'UA', 'E', 155, 99.0),
      ('overclock',       'Ryan Chen',         'US', 'E', 170, 99.4),
      ('zero_latency',    'Sakura Ito',        'JP', 'E', 162, 99.2),
      ('blazekeys',       'Thor Eriksen',      'NO', 'E', 145, 98.8),
      ('hyperdrive',      'Ines Moreau',       'FR', 'E', 152, 99.0),
      ('warp_speed',      'Kim Soo-Jin',       'KR', 'E', 168, 99.3),
      ('turbo_fingers',   'Leo Bergström',     'SE', 'E', 142, 98.8)
    ) AS t(username, display_name, country_code, tier, base_wpm, base_accuracy)
  LOOP
    -- Create user (idempotent)
    INSERT INTO users (email, password_hash)
    VALUES (bot.username || '@bot.race.local', 'bot-seed')
    ON CONFLICT (email) DO NOTHING;

    SELECT id INTO v_user_id FROM users WHERE email = bot.username || '@bot.race.local';

    -- Create profile (idempotent)
    INSERT INTO profiles (user_id, username, display_name, avatar_url, country_code)
    VALUES (
      v_user_id,
      bot.username,
      bot.display_name,
      'https://api.dicebear.com/9.x/avataaars/svg?seed=' || bot.username,
      bot.country_code
    )
    ON CONFLICT (user_id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      avatar_url = EXCLUDED.avatar_url,
      country_code = EXCLUDED.country_code,
      updated_at = NOW();
  END LOOP;

  RAISE NOTICE 'Created/updated 75 bot users and profiles.';
END $$;


-- ============================================================================
-- STEP 2: Ensure hubs exist for the 10 main languages
-- ============================================================================

INSERT INTO hubs (slug, language, title, is_ranked, is_active) VALUES
  ('python',     'python',     'Python Hub',     TRUE, TRUE),
  ('javascript', 'javascript', 'JavaScript Hub', TRUE, TRUE),
  ('typescript', 'typescript', 'TypeScript Hub',  TRUE, TRUE),
  ('go',         'go',         'Go Hub',          TRUE, TRUE),
  ('rust',       'rust',       'Rust Hub',        TRUE, TRUE),
  ('java',       'java',       'Java Hub',        TRUE, TRUE),
  ('c',          'c',          'C Hub',           TRUE, TRUE),
  ('kotlin',     'kotlin',     'Kotlin Hub',      TRUE, TRUE),
  ('swift',      'swift',      'Swift Hub',       TRUE, TRUE),
  ('ruby',       'ruby',       'Ruby Hub',        TRUE, TRUE)
ON CONFLICT (slug) DO UPDATE SET is_active = TRUE;


-- ============================================================================
-- STEP 3: Generate ~2500 historical races over the last 90 days
-- ============================================================================
-- Uses PL/pgSQL to create races with randomized but realistic data.
-- Each race has 2-4 participants from the bot pool.
-- Race distribution: more races on recent days (exponential ramp-up).
-- Bot WPM varies per race around their base_wpm (+/- 15%).

DO $$
DECLARE
  -- Hub distribution weights (more popular hubs get more races)
  hub_slugs TEXT[] := ARRAY[
    'python', 'javascript', 'typescript', 'go', 'rust',
    'java', 'c', 'kotlin', 'swift', 'ruby'
  ];
  hub_weights INT[] := ARRAY[
    20, 18, 15, 14, 10,
    8, 5, 4, 3, 3
  ];

  total_races INT := 2500;
  days_span   INT := 90;

  -- Loop variables
  race_num       INT;
  day_offset     FLOAT;
  hub_idx        INT;
  hub_slug       TEXT;
  hub_id_val     UUID;
  snippet_id_val UUID;
  race_id_val    UUID;
  ext_race_id    TEXT;
  race_started   TIMESTAMPTZ;
  race_duration  INTERVAL;
  race_ended     TIMESTAMPTZ;
  num_participants INT;
  participant_ids UUID[];
  participant_wpms FLOAT[];
  participant_accs FLOAT[];
  bot_user_id    UUID;
  bot_base_wpm   FLOAT;
  bot_base_acc   FLOAT;
  race_wpm       FLOAT;
  race_acc       FLOAT;
  race_net_wpm   FLOAT;
  race_errors    INT;
  race_completion FLOAT;
  position       INT;
  rand_val       FLOAT;
  weight_sum     INT;
  cumulative     INT;
  i              INT;
  j              INT;
  temp_id        UUID;
  temp_wpm       FLOAT;
  temp_acc       FLOAT;
  snippet_len    INT;
  existing_count INT;
BEGIN
  -- Skip if bot races already exist (idempotency)
  SELECT COUNT(*) INTO existing_count
  FROM races WHERE external_race_id LIKE 'bot-seed-%';

  IF existing_count > 100 THEN
    RAISE NOTICE 'Bot seed races already exist (% found), skipping race generation.', existing_count;
    RETURN;
  END IF;

  -- Clean up any partial previous run
  DELETE FROM races WHERE external_race_id LIKE 'bot-seed-%';

  -- Pre-calculate total hub weight for weighted random selection
  weight_sum := 0;
  FOR i IN 1..array_length(hub_weights, 1) LOOP
    weight_sum := weight_sum + hub_weights[i];
  END LOOP;

  FOR race_num IN 1..total_races LOOP
    -- ---- Pick a day offset (0 = today, 90 = 90 days ago) ----
    -- Exponential distribution: more races on recent days
    -- Formula: day_offset = days_span * (1 - random()^0.5)
    -- This clusters more races toward day 0 (today)
    rand_val := random();
    day_offset := days_span * (1.0 - pow(rand_val, 0.5));

    -- Add random hour/minute within the day (skew toward 9am-11pm)
    race_started := NOW()
      - (day_offset || ' days')::INTERVAL
      - ((random() * 14 + 9) || ' hours')::INTERVAL   -- 9am to 11pm
      - ((random() * 60) || ' minutes')::INTERVAL;

    -- ---- Pick a hub (weighted random) ----
    rand_val := random() * weight_sum;
    cumulative := 0;
    hub_idx := 1;
    FOR i IN 1..array_length(hub_weights, 1) LOOP
      cumulative := cumulative + hub_weights[i];
      IF rand_val <= cumulative THEN
        hub_idx := i;
        EXIT;
      END IF;
    END LOOP;
    hub_slug := hub_slugs[hub_idx];

    -- Get hub ID
    SELECT id INTO hub_id_val FROM hubs WHERE slug = hub_slug LIMIT 1;
    IF hub_id_val IS NULL THEN
      CONTINUE;
    END IF;

    -- ---- Pick a random snippet for this hub's language ----
    SELECT id, length(code) INTO snippet_id_val, snippet_len
    FROM snippets
    WHERE language = hub_slug AND is_active = TRUE
    ORDER BY random()
    LIMIT 1;

    IF snippet_id_val IS NULL THEN
      -- Fallback: use any snippet
      SELECT id, length(code) INTO snippet_id_val, snippet_len
      FROM snippets
      WHERE is_active = TRUE
      ORDER BY random()
      LIMIT 1;
    END IF;

    IF snippet_id_val IS NULL THEN
      CONTINUE;
    END IF;

    -- Default snippet length if somehow missing
    IF snippet_len IS NULL OR snippet_len < 20 THEN
      snippet_len := 120;
    END IF;

    -- ---- Pick 2-4 random bot participants ----
    num_participants := 2 + floor(random() * 3)::INT;  -- 2, 3, or 4

    -- Select random bot user IDs
    participant_ids := ARRAY(
      SELECT u.id
      FROM users u
      WHERE u.email LIKE '%@bot.race.local'
      ORDER BY random()
      LIMIT num_participants
    );

    IF array_length(participant_ids, 1) IS NULL OR array_length(participant_ids, 1) < 2 THEN
      CONTINUE;
    END IF;

    num_participants := array_length(participant_ids, 1);

    -- ---- Calculate per-participant WPM and accuracy ----
    participant_wpms := ARRAY[]::FLOAT[];
    participant_accs := ARRAY[]::FLOAT[];

    FOR i IN 1..num_participants LOOP
      bot_user_id := participant_ids[i];

      -- Look up the bot's base stats from our known set
      -- We derive base_wpm from a subquery since we can't easily reference
      -- the VALUES table. Instead, use a deterministic approach based on
      -- the user's email prefix mapped through a helper query.
      SELECT
        CASE
          -- Reconstruct base_wpm from the bot data by matching email
          WHEN u.email LIKE 'newbie_%'       THEN 38
          WHEN u.email LIKE 'first_steps_%'  THEN 42
          WHEN u.email LIKE 'slow_coder_%'   THEN 35
          WHEN u.email LIKE 'learning_%'     THEN 48
          WHEN u.email LIKE 'keysmash_%'     THEN 44
          WHEN u.email LIKE 'baby_%'         THEN 40
          WHEN u.email LIKE 'casual_coder%'  THEN 52
          WHEN u.email LIKE 'hunt_%'         THEN 33
          WHEN u.email LIKE 'newb_%'         THEN 46
          WHEN u.email LIKE 'starter_%'      THEN 50
          WHEN u.email LIKE 'hello_%'        THEN 37
          WHEN u.email LIKE 'one_finger%'    THEN 31
          WHEN u.email LIKE 'code_curious%'  THEN 55
          WHEN u.email LIKE 'fresh_%'        THEN 43
          WHEN u.email LIKE 'tiny_%'         THEN 47
          WHEN u.email LIKE 'lightning_%'    THEN 158
          WHEN u.email LIKE 'quantum_%'      THEN 165
          WHEN u.email LIKE 'fiber_%'        THEN 148
          WHEN u.email LIKE 'mach_%'         THEN 155
          WHEN u.email LIKE 'overclock%'     THEN 170
          WHEN u.email LIKE 'zero_latency%'  THEN 162
          WHEN u.email LIKE 'blazekeys%'     THEN 145
          WHEN u.email LIKE 'hyperdrive%'    THEN 152
          WHEN u.email LIKE 'warp_%'         THEN 168
          WHEN u.email LIKE 'turbo_fingers%' THEN 142
          WHEN u.email LIKE 'swift_%'        THEN 112
          WHEN u.email LIKE 'rustacean_%'    THEN 125
          WHEN u.email LIKE 'pycraft_%'      THEN 108
          WHEN u.email LIKE 'gopher_%'       THEN 118
          WHEN u.email LIKE 'ts_wizard%'     THEN 132
          WHEN u.email LIKE 'codeflow_%'     THEN 105
          WHEN u.email LIKE 'algo_%'         THEN 128
          WHEN u.email LIKE 'kernel_%'       THEN 115
          WHEN u.email LIKE 'blazing_%'      THEN 135
          WHEN u.email LIKE 'turbo_type%'    THEN 110
          WHEN u.email LIKE 'hot_reload%'    THEN 122
          WHEN u.email LIKE 'zero_alloc%'    THEN 138
          WHEN u.email LIKE 'mono_repo%'     THEN 103
          WHEN u.email LIKE 'trait_%'        THEN 120
          WHEN u.email LIKE 'pattern_%'      THEN 130
          WHEN u.email LIKE 'type_theory%'   THEN 107
          WHEN u.email LIKE 'wasm_%'         THEN 116
          WHEN u.email LIKE 'edge_%'         THEN 126
          WHEN u.email LIKE 'perf_%'         THEN 133
          WHEN u.email LIKE 'ship_%'         THEN 109
          ELSE 75 -- default intermediate
        END,
        CASE
          WHEN u.email LIKE 'newbie_%'       THEN 94.2
          WHEN u.email LIKE 'first_steps_%'  THEN 93.8
          WHEN u.email LIKE 'slow_coder_%'   THEN 93.5
          WHEN u.email LIKE 'learning_%'     THEN 94.5
          WHEN u.email LIKE 'keysmash_%'     THEN 94.0
          WHEN u.email LIKE 'baby_%'         THEN 93.7
          WHEN u.email LIKE 'casual_coder%'  THEN 95.0
          WHEN u.email LIKE 'hunt_%'         THEN 93.2
          WHEN u.email LIKE 'newb_%'         THEN 94.3
          WHEN u.email LIKE 'starter_%'      THEN 94.8
          WHEN u.email LIKE 'hello_%'        THEN 93.6
          WHEN u.email LIKE 'one_finger%'    THEN 93.0
          WHEN u.email LIKE 'code_curious%'  THEN 95.2
          WHEN u.email LIKE 'fresh_%'        THEN 94.1
          WHEN u.email LIKE 'tiny_%'         THEN 94.4
          WHEN u.email LIKE 'lightning_%'    THEN 99.1
          WHEN u.email LIKE 'quantum_%'      THEN 99.3
          WHEN u.email LIKE 'fiber_%'        THEN 98.9
          WHEN u.email LIKE 'mach_%'         THEN 99.0
          WHEN u.email LIKE 'overclock%'     THEN 99.4
          WHEN u.email LIKE 'zero_latency%'  THEN 99.2
          WHEN u.email LIKE 'blazekeys%'     THEN 98.8
          WHEN u.email LIKE 'hyperdrive%'    THEN 99.0
          WHEN u.email LIKE 'warp_%'         THEN 99.3
          WHEN u.email LIKE 'turbo_fingers%' THEN 98.8
          WHEN u.email LIKE 'swift_%'        THEN 98.1
          WHEN u.email LIKE 'rustacean_%'    THEN 98.5
          WHEN u.email LIKE 'pycraft_%'      THEN 97.9
          WHEN u.email LIKE 'gopher_%'       THEN 98.3
          WHEN u.email LIKE 'ts_wizard%'     THEN 98.7
          WHEN u.email LIKE 'codeflow_%'     THEN 97.8
          WHEN u.email LIKE 'algo_%'         THEN 98.6
          WHEN u.email LIKE 'kernel_%'       THEN 98.2
          WHEN u.email LIKE 'blazing_%'      THEN 98.8
          WHEN u.email LIKE 'turbo_type%'    THEN 98.0
          WHEN u.email LIKE 'hot_reload%'    THEN 98.4
          WHEN u.email LIKE 'zero_alloc%'    THEN 98.9
          WHEN u.email LIKE 'mono_repo%'     THEN 97.7
          WHEN u.email LIKE 'trait_%'        THEN 98.3
          WHEN u.email LIKE 'pattern_%'      THEN 98.7
          WHEN u.email LIKE 'type_theory%'   THEN 97.9
          WHEN u.email LIKE 'wasm_%'         THEN 98.2
          WHEN u.email LIKE 'edge_%'         THEN 98.5
          WHEN u.email LIKE 'perf_%'         THEN 98.8
          WHEN u.email LIKE 'ship_%'         THEN 98.0
          ELSE 96.5 -- default intermediate
        END
      INTO bot_base_wpm, bot_base_acc
      FROM users u
      WHERE u.id = bot_user_id;

      -- Add per-race variance: +/- 15% on WPM, +/- 1.5% on accuracy
      race_wpm := bot_base_wpm * (0.85 + random() * 0.30);
      race_acc := LEAST(99.9, GREATEST(90.0, bot_base_acc + (random() * 3.0 - 1.5)));
      race_net_wpm := race_wpm * (race_acc / 100.0);

      participant_wpms := participant_wpms || race_wpm;
      participant_accs := participant_accs || race_acc;
    END LOOP;

    -- ---- Sort participants by net_wpm descending (for position assignment) ----
    -- Simple bubble sort on the parallel arrays
    FOR i IN 1..num_participants LOOP
      FOR j IN i+1..num_participants LOOP
        IF (participant_wpms[j] * participant_accs[j]) > (participant_wpms[i] * participant_accs[i]) THEN
          -- Swap all arrays
          temp_id := participant_ids[i];
          participant_ids[i] := participant_ids[j];
          participant_ids[j] := temp_id;

          temp_wpm := participant_wpms[i];
          participant_wpms[i] := participant_wpms[j];
          participant_wpms[j] := temp_wpm;

          temp_acc := participant_accs[i];
          participant_accs[i] := participant_accs[j];
          participant_accs[j] := temp_acc;
        END IF;
      END LOOP;
    END LOOP;

    -- ---- Estimate race duration from winner's WPM and snippet length ----
    -- WPM = (chars / 5) / (minutes)  =>  minutes = (chars / 5) / WPM
    -- Use the winner's (fastest) WPM for race_ended calculation
    IF participant_wpms[1] > 0 THEN
      race_duration := ((snippet_len::FLOAT / 5.0) / participant_wpms[1] * 60.0 || ' seconds')::INTERVAL;
    ELSE
      race_duration := '120 seconds'::INTERVAL;
    END IF;

    race_ended := race_started + race_duration;
    ext_race_id := 'bot-seed-' || race_num;

    -- ---- Insert the race ----
    INSERT INTO races (hub_id, snippet_id, status, started_at, ended_at, created_at, external_race_id, external_room_id, finish_reason)
    VALUES (hub_id_val, snippet_id_val, 'finished', race_started, race_ended, race_started, ext_race_id, 'bot-room-' || race_num, 'completed')
    RETURNING id INTO race_id_val;

    -- ---- Insert participants ----
    FOR i IN 1..num_participants LOOP
      race_wpm := participant_wpms[i];
      race_acc := participant_accs[i];
      race_net_wpm := race_wpm * (race_acc / 100.0);
      race_errors := GREATEST(0, floor((100.0 - race_acc) / 100.0 * snippet_len / 5.0)::INT);

      -- ~5% chance of DNF (incomplete race)
      IF random() < 0.05 THEN
        race_completion := 70.0 + random() * 25.0;  -- 70-95%
      ELSE
        race_completion := 100.0;
      END IF;

      position := i;

      INSERT INTO race_participants (
        race_id, user_id, final_position, completion_percent,
        gross_wpm, net_wpm, accuracy, errors_count, corrections_count,
        finished_at
      ) VALUES (
        race_id_val, participant_ids[i], position, ROUND(race_completion::NUMERIC, 2),
        ROUND(race_wpm::NUMERIC, 2), ROUND(race_net_wpm::NUMERIC, 2),
        ROUND(race_acc::NUMERIC, 2), race_errors, floor(race_errors * 0.6)::INT,
        CASE WHEN race_completion >= 100.0
          THEN race_started + ((snippet_len::FLOAT / 5.0) / race_wpm * 60.0 || ' seconds')::INTERVAL
          ELSE NULL
        END
      )
      ON CONFLICT (race_id, user_id) DO NOTHING;
    END LOOP;

    -- Progress logging every 500 races
    IF race_num % 500 = 0 THEN
      RAISE NOTICE 'Generated % / % races...', race_num, total_races;
    END IF;

  END LOOP;

  RAISE NOTICE 'Finished generating % bot races.', total_races;
END $$;


-- ============================================================================
-- STEP 4: Verification queries (informational, won't fail the transaction)
-- ============================================================================

DO $$
DECLARE
  user_count INT;
  race_count INT;
  hub_count  INT;
  part_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users WHERE email LIKE '%@bot.race.local';
  SELECT COUNT(*) INTO race_count FROM races WHERE external_race_id LIKE 'bot-seed-%';
  SELECT COUNT(DISTINCT hub_id) INTO hub_count FROM races WHERE external_race_id LIKE 'bot-seed-%';
  SELECT COUNT(*) INTO part_count FROM race_participants rp
    JOIN races r ON rp.race_id = r.id
    WHERE r.external_race_id LIKE 'bot-seed-%';

  RAISE NOTICE '=== Bot Seed Summary ===';
  RAISE NOTICE 'Bot users: %', user_count;
  RAISE NOTICE 'Races generated: %', race_count;
  RAISE NOTICE 'Hubs with races: %', hub_count;
  RAISE NOTICE 'Total race participations: %', part_count;
END $$;

COMMIT;
