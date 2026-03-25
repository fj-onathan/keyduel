package bot

import (
	"os"
	"strconv"
	"time"
)

// Config holds all bot-runner configuration.
type Config struct {
	// Enabled is the master toggle. When false the runner exits immediately.
	Enabled bool

	// Concurrency is the baseline number of bots (used as default for min/max if not set).
	Concurrency int

	// MinConcurrency is the minimum number of bots online at any time.
	MinConcurrency int

	// MaxConcurrency is the maximum number of bots online at any time.
	MaxConcurrency int

	// RaceInterval is the time between bot-initiated race batches.
	RaceInterval time.Duration

	// WSURL is the WebSocket endpoint of the race-engine (e.g. ws://localhost:8081/ws).
	WSURL string

	// APIURL is the HTTP endpoint of the race-engine (e.g. http://localhost:8081).
	APIURL string

	// DatabaseURL is the Postgres connection string (to load bot identities).
	DatabaseURL string

	// RedisURL is the Redis connection string (for admin toggle + queue-fill).
	RedisURL string
}

// LoadConfig reads bot configuration from environment variables with sensible defaults.
func LoadConfig() Config {
	concurrency := envInt("BOT_CONCURRENCY", 5)
	minC := envInt("BOT_MIN_CONCURRENCY", 0)
	maxC := envInt("BOT_MAX_CONCURRENCY", 0)

	// If min/max not explicitly set, derive from concurrency.
	// Range is roughly concurrency * 0.4 to concurrency * 1.8, clamped to [1, identity pool].
	if minC <= 0 {
		minC = max(1, concurrency*2/5) // e.g. 5 -> 2, 8 -> 3
	}
	if maxC <= 0 {
		maxC = max(minC+1, concurrency*9/5) // e.g. 5 -> 9, 8 -> 14
	}
	if maxC <= minC {
		maxC = minC + 1
	}

	return Config{
		Enabled:        envBool("BOT_ENABLED", false),
		Concurrency:    concurrency,
		MinConcurrency: minC,
		MaxConcurrency: maxC,
		RaceInterval:   time.Duration(envInt("BOT_RACE_INTERVAL_SECONDS", 600)) * time.Second,
		WSURL:          envStr("BOT_WS_URL", "ws://localhost:8081/ws"),
		APIURL:         envStr("BOT_API_URL", "http://localhost:8081"),
		DatabaseURL:    envStr("DATABASE_URL", "postgres://typing_game:typing_game@localhost:5432/typing_game?sslmode=disable"),
		RedisURL:       envStr("REDIS_URL", "redis://localhost:6379"),
	}
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func envStr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func envInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}

func envBool(key string, fallback bool) bool {
	if v := os.Getenv(key); v != "" {
		if b, err := strconv.ParseBool(v); err == nil {
			return b
		}
	}
	return fallback
}
