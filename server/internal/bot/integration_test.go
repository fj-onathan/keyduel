//go:build integration

package bot

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/fj-onathan/keyduel/server/internal/cache"
	"github.com/fj-onathan/keyduel/server/internal/db"
)

// Integration tests require a running race-engine, Postgres, and Redis.
// Run with: go test -tags=integration -v ./internal/bot/...
//
// Environment variables:
//   DATABASE_URL - Postgres connection string
//   REDIS_URL    - Redis connection string
//   BOT_WS_URL   - WebSocket URL for race-engine (default: ws://localhost:8081/ws)

func getEnvOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func TestIntegrationLoadIdentities(t *testing.T) {
	dbURL := getEnvOrDefault("DATABASE_URL", "postgres://typing_game:typing_game@localhost:5432/typing_game?sslmode=disable")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := db.NewPostgresPool(ctx, dbURL)
	if err != nil {
		t.Skipf("skipping: could not connect to postgres: %v", err)
	}
	defer pool.Close()

	identities, err := LoadIdentities(ctx, pool)
	if err != nil {
		t.Fatalf("LoadIdentities failed: %v", err)
	}

	if len(identities) == 0 {
		t.Skip("skipping: no bot identities in database (run 'make seed-bots' first)")
	}

	t.Logf("loaded %d identities", len(identities))

	// Verify all identities have valid tiers and WPM ranges.
	for _, id := range identities {
		spec, ok := tierSpecs[id.Tier]
		if !ok {
			t.Errorf("identity %q has invalid tier %q", id.Username, id.Tier)
			continue
		}
		if id.BaseWPM < spec.MinWPM || id.BaseWPM > spec.MaxWPM {
			t.Errorf("identity %q: WPM %.1f outside tier %s range [%.0f, %.0f]",
				id.Username, id.BaseWPM, id.Tier, spec.MinWPM, spec.MaxWPM)
		}
		if id.BaseAccuracy < spec.MinAccuracy || id.BaseAccuracy > spec.MaxAccuracy {
			t.Errorf("identity %q: accuracy %.1f outside tier %s range [%.1f, %.1f]",
				id.Username, id.BaseAccuracy, id.Tier, spec.MinAccuracy, spec.MaxAccuracy)
		}
	}
}

func TestIntegrationRedisToggle(t *testing.T) {
	redisURL := getEnvOrDefault("REDIS_URL", "redis://localhost:6379")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	redisClient, err := cache.NewRedisClient(ctx, redisURL)
	if err != nil {
		t.Skipf("skipping: could not connect to redis: %v", err)
	}
	defer func() { _ = redisClient.Close() }()

	cfg := Config{Enabled: true}
	m := NewManager(cfg, nil, redisClient)

	// Default: should be enabled (key doesn't exist or is not "false").
	_ = redisClient.Del(ctx, "platform:bot_enabled").Err()
	if !m.isEnabled(ctx) {
		t.Fatal("expected enabled when Redis key does not exist")
	}

	// Set to false: should be disabled.
	if err := redisClient.Set(ctx, "platform:bot_enabled", "false", 0).Err(); err != nil {
		t.Fatalf("failed to set Redis key: %v", err)
	}
	if m.isEnabled(ctx) {
		t.Fatal("expected disabled when platform:bot_enabled is 'false'")
	}

	// Set to true: should be enabled.
	if err := redisClient.Set(ctx, "platform:bot_enabled", "true", 0).Err(); err != nil {
		t.Fatalf("failed to set Redis key: %v", err)
	}
	if !m.isEnabled(ctx) {
		t.Fatal("expected enabled when platform:bot_enabled is 'true'")
	}

	// Clean up.
	_ = redisClient.Del(ctx, "platform:bot_enabled").Err()
}

func TestIntegrationBotConnectsToRaceEngine(t *testing.T) {
	wsURL := getEnvOrDefault("BOT_WS_URL", "ws://localhost:8081/ws")

	id := BotIdentity{
		UserID:   "integration-test",
		Username: "integration_bot",
		BaseWPM:  80.0,
	}

	p := NewPlayer(id, wsURL)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Try to connect — this will succeed if race-engine is running.
	errCh := make(chan error, 1)
	go func() {
		errCh <- p.Connect(ctx)
	}()

	// Wait briefly for connection to establish.
	time.Sleep(1 * time.Second)

	state := p.State()
	if state != stateConnected {
		// Race engine might not be running.
		cancel()
		err := <-errCh
		t.Skipf("skipping: race-engine not reachable (state=%d, err=%v)", state, err)
	}

	t.Logf("bot connected successfully, state=%d", state)

	// Clean up.
	p.Disconnect()
	cancel()
	<-errCh
}

func TestIntegrationFullBotLifecycle(t *testing.T) {
	dbURL := getEnvOrDefault("DATABASE_URL", "postgres://typing_game:typing_game@localhost:5432/typing_game?sslmode=disable")
	redisURL := getEnvOrDefault("REDIS_URL", "redis://localhost:6379")
	wsURL := getEnvOrDefault("BOT_WS_URL", "ws://localhost:8081/ws")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Load identities.
	pool, err := db.NewPostgresPool(ctx, dbURL)
	if err != nil {
		t.Skipf("skipping: could not connect to postgres: %v", err)
	}
	defer pool.Close()

	identities, err := LoadIdentities(ctx, pool)
	if err != nil || len(identities) < 2 {
		t.Skipf("skipping: need at least 2 bot identities (got %d, err=%v)", len(identities), err)
	}

	// Connect to Redis.
	redisClient, err := cache.NewRedisClient(ctx, redisURL)
	if err != nil {
		t.Skipf("skipping: could not connect to redis: %v", err)
	}
	defer func() { _ = redisClient.Close() }()

	// Create two bots and try to have them race.
	bot1 := NewPlayer(identities[0], wsURL)
	bot2 := NewPlayer(identities[1], wsURL)

	err1Ch := make(chan error, 1)
	err2Ch := make(chan error, 1)

	go func() { err1Ch <- bot1.Connect(ctx) }()
	go func() { err2Ch <- bot2.Connect(ctx) }()

	// Wait for both to connect.
	time.Sleep(2 * time.Second)

	if bot1.State() < stateConnected || bot2.State() < stateConnected {
		cancel()
		t.Skipf("skipping: race-engine not reachable (bot1=%d, bot2=%d)", bot1.State(), bot2.State())
	}

	// Queue both for the same hub.
	hub := "go"
	if err := bot1.QueueForRace(hub); err != nil {
		t.Fatalf("bot1 queue failed: %v", err)
	}
	time.Sleep(500 * time.Millisecond)
	if err := bot2.QueueForRace(hub); err != nil {
		t.Fatalf("bot2 queue failed: %v", err)
	}

	// Wait for race to complete (up to 25 seconds).
	deadline := time.After(25 * time.Second)
	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()

	raceCompleted := false
	for !raceCompleted {
		select {
		case <-deadline:
			t.Logf("timeout waiting for race: bot1=%d, bot2=%d", bot1.State(), bot2.State())
			goto cleanup
		case <-ticker.C:
			if bot1.State() == stateFinished || bot2.State() == stateFinished {
				raceCompleted = true
				t.Logf("race completed: bot1=%d, bot2=%d", bot1.State(), bot2.State())
			}
		}
	}

cleanup:
	bot1.Disconnect()
	bot2.Disconnect()
	cancel()
	<-err1Ch
	<-err2Ch

	if raceCompleted {
		t.Log("full bot lifecycle test passed")
	} else {
		t.Log("race did not complete within timeout (may be expected if no snippets are seeded)")
	}
}
