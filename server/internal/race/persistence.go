package race

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/fj-onathan/keyduel/server/internal/transport/ws"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type Persistence struct {
	db    *pgxpool.Pool
	cache *redis.Client
}

func NewPersistence(db *pgxpool.Pool, cache *redis.Client) *Persistence {
	return &Persistence{db: db, cache: cache}
}

func (p *Persistence) PersistRace(ctx context.Context, snapshot ws.RaceSnapshot) error {
	if p == nil || p.db == nil {
		return errors.New("race persistence not configured")
	}

	if snapshot.RaceID == "" {
		return errors.New("race id is required")
	}

	tx, err := p.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return fmt.Errorf("begin transaction: %w", err)
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	hubID, err := ensureHub(ctx, tx, snapshot.Hub)
	if err != nil {
		return err
	}

	snippetID, err := ensureSnippet(ctx, tx, snapshot.Hub, snapshot.Snippet)
	if err != nil {
		return err
	}

	raceDBID, inserted, err := upsertRace(ctx, tx, snapshot, hubID, snippetID)
	if err != nil {
		return err
	}
	if !inserted {
		if err := tx.Commit(ctx); err != nil {
			return fmt.Errorf("commit idempotent transaction: %w", err)
		}
		return nil
	}

	for _, result := range snapshot.Results {
		if strings.TrimSpace(result.ClientID) == "" {
			continue
		}

		// Skip bot participants — they should not be persisted to the
		// database to avoid inflating leaderboards and stats.
		if result.IsBot {
			continue
		}

		var userID string
		if result.AuthUserID != "" {
			// Authenticated user — use the real database user ID directly.
			userID = result.AuthUserID
		} else {
			// Guest — create or look up a synthetic user.
			var err error
			userID, err = ensureSyntheticUser(ctx, tx, result.ClientID)
			if err != nil {
				return err
			}
		}

		var finishedAt any
		if result.Finished {
			finishedAt = snapshot.StartedAt.Add(time.Duration(result.FinishedElapsedMS) * time.Millisecond)
		}

		_, err = tx.Exec(ctx, `
INSERT INTO race_participants (
    race_id,
    user_id,
    final_position,
    completion_percent,
    gross_wpm,
    net_wpm,
    accuracy,
    errors_count,
    corrections_count,
    finished_at
) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
ON CONFLICT (race_id, user_id) DO NOTHING
`, raceDBID, userID, result.Position, result.CompletionPercent, result.GrossWPM, result.NetWPM, result.Accuracy, result.Errors, 0, finishedAt)
		if err != nil {
			return fmt.Errorf("insert race participant %s: %w", result.ClientID, err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit transaction: %w", err)
	}

	p.invalidateLeaderboardCache(ctx, snapshot)

	return nil
}

func (p *Persistence) invalidateLeaderboardCache(ctx context.Context, snapshot ws.RaceSnapshot) {
	if p.cache == nil {
		return
	}

	hub := strings.TrimSpace(strings.ToLower(snapshot.Hub))
	if hub == "" {
		return
	}

	var hubID string
	err := p.db.QueryRow(ctx, `SELECT id::text FROM hubs WHERE slug = $1 LIMIT 1`, hub).Scan(&hubID)
	if err != nil || hubID == "" {
		return
	}

	patterns := []string{
		"leaderboard:v2:scope:hub:" + hubID + ":*",
		"leaderboard:v2:scope:global:*",
	}

	for _, pattern := range patterns {
		var cursor uint64
		for {
			keys, nextCursor, err := p.cache.Scan(ctx, cursor, pattern, 100).Result()
			if err != nil {
				return
			}
			if len(keys) > 0 {
				_ = p.cache.Del(ctx, keys...).Err()
			}
			if nextCursor == 0 {
				break
			}
			cursor = nextCursor
		}
	}
}

func ensureHub(ctx context.Context, tx pgx.Tx, hub string) (string, error) {
	hub = strings.TrimSpace(strings.ToLower(hub))
	if hub == "" {
		hub = "go"
	}

	title := strings.ToUpper(hub) + " Hub"
	var hubID string
	err := tx.QueryRow(ctx, `
WITH ins AS (
	INSERT INTO hubs (slug, language, title, is_ranked, is_active)
	VALUES ($1, $2, $3, TRUE, TRUE)
	ON CONFLICT (slug) DO NOTHING
	RETURNING id::text
)
SELECT id FROM ins
UNION ALL
SELECT id::text FROM hubs WHERE slug = $1
LIMIT 1
`, hub, hub, title).Scan(&hubID)
	if err != nil {
		return "", fmt.Errorf("ensure hub: %w", err)
	}

	return hubID, nil
}

func ensureSnippet(ctx context.Context, tx pgx.Tx, language string, snippet string) (string, error) {
	if strings.TrimSpace(language) == "" {
		language = "go"
	}
	if strings.TrimSpace(snippet) == "" {
		snippet = "// missing snippet"
	}

	var snippetID string
	err := tx.QueryRow(ctx, `
WITH existing AS (
    SELECT id
    FROM snippets
    WHERE language = $1 AND code = $2
    ORDER BY created_at ASC
    LIMIT 1
)
INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT $1, $3, 2, $2, 'realtime-room', TRUE
WHERE NOT EXISTS (SELECT 1 FROM existing)
RETURNING id::text
`, language, snippet, language+" realtime snippet").Scan(&snippetID)
	if err != nil {
		if !errors.Is(err, pgx.ErrNoRows) {
			return "", fmt.Errorf("ensure snippet insert: %w", err)
		}

		err = tx.QueryRow(ctx, `
SELECT id::text
FROM snippets
WHERE language = $1 AND code = $2
ORDER BY created_at ASC
LIMIT 1
`, language, snippet).Scan(&snippetID)
		if err != nil {
			return "", fmt.Errorf("ensure snippet select: %w", err)
		}
	}

	return snippetID, nil
}

func upsertRace(ctx context.Context, tx pgx.Tx, snapshot ws.RaceSnapshot, hubID string, snippetID string) (string, bool, error) {
	var raceID string
	err := tx.QueryRow(ctx, `
INSERT INTO races (
    hub_id,
    snippet_id,
    status,
    started_at,
    ended_at,
    external_race_id,
    external_room_id,
    finish_reason
) VALUES ($1,$2,'finished',$3,$4,$5,$6,$7)
ON CONFLICT (external_race_id) WHERE external_race_id IS NOT NULL
DO NOTHING
RETURNING id::text
`, hubID, snippetID, snapshot.StartedAt, snapshot.EndedAt, snapshot.RaceID, snapshot.RoomID, snapshot.FinishReason).Scan(&raceID)
	if err != nil {
		if !errors.Is(err, pgx.ErrNoRows) {
			return "", false, fmt.Errorf("insert race: %w", err)
		}

		err = tx.QueryRow(ctx, `
SELECT id::text
FROM races
WHERE external_race_id = $1
`, snapshot.RaceID).Scan(&raceID)
		if err != nil {
			return "", false, fmt.Errorf("load existing race: %w", err)
		}
		return raceID, false, nil
	}

	return raceID, true, nil
}

func ensureSyntheticUser(ctx context.Context, tx pgx.Tx, clientID string) (string, error) {
	clean := strings.ToLower(strings.TrimSpace(clientID))
	clean = strings.ReplaceAll(clean, " ", "-")
	if clean == "" {
		clean = "unknown"
	}

	email := clean + "@race.local"
	username := clean

	var userID string
	err := tx.QueryRow(ctx, `
INSERT INTO users (email, password_hash)
VALUES ($1, 'socket_user')
ON CONFLICT (email)
DO UPDATE SET email = EXCLUDED.email
RETURNING id::text
`, email).Scan(&userID)
	if err != nil {
		return "", fmt.Errorf("ensure user %s: %w", clientID, err)
	}

	// Handle both conflicts: user_id (PK) if the synthetic user already has a
	// profile, and username (unique) if a seeded bot or another user already
	// owns that username — in which case we look up the existing owner.
	_, err = tx.Exec(ctx, `
INSERT INTO profiles (user_id, username)
VALUES ($1, $2)
ON CONFLICT (user_id) DO NOTHING
`, userID, username)
	if err != nil {
		// Check if this is a username uniqueness violation.
		if strings.Contains(err.Error(), "profiles_username_key") {
			// The username already exists under a different user_id (e.g. a seeded bot).
			// Look up the real owner and return that user_id instead.
			var existingUserID string
			lookupErr := tx.QueryRow(ctx, `
SELECT user_id::text FROM profiles WHERE username = $1
`, username).Scan(&existingUserID)
			if lookupErr != nil {
				return "", fmt.Errorf("ensure profile %s: username conflict and lookup failed: %w", clientID, lookupErr)
			}
			return existingUserID, nil
		}
		return "", fmt.Errorf("ensure profile %s: %w", clientID, err)
	}

	return userID, nil
}
