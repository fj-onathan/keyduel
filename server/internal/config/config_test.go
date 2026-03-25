package config

import "testing"

func TestGetEnvReturnsFallbackWhenMissing(t *testing.T) {
	t.Setenv("TG_UNKNOWN_KEY", "")

	got := getEnv("TG_UNKNOWN_KEY", "fallback")
	if got != "fallback" {
		t.Fatalf("expected fallback, got %q", got)
	}
}

func TestGetEnvReturnsValueWhenSet(t *testing.T) {
	t.Setenv("TG_SET_KEY", "value")

	got := getEnv("TG_SET_KEY", "fallback")
	if got != "value" {
		t.Fatalf("expected value, got %q", got)
	}
}

func TestLoadUsesEnvironmentOverrides(t *testing.T) {
	t.Setenv("APP_ENV", "test")
	t.Setenv("API_PORT", "18080")
	t.Setenv("RACE_ENGINE_PORT", "18081")
	t.Setenv("DATABASE_URL", "postgres://user:pass@localhost:5432/db?sslmode=disable")
	t.Setenv("REDIS_URL", "redis://localhost:6380")

	cfg := Load()

	if cfg.AppEnv != "test" {
		t.Fatalf("expected APP_ENV test, got %q", cfg.AppEnv)
	}
	if cfg.APIPort != "18080" {
		t.Fatalf("expected API_PORT 18080, got %q", cfg.APIPort)
	}
	if cfg.RaceEnginePort != "18081" {
		t.Fatalf("expected RACE_ENGINE_PORT 18081, got %q", cfg.RaceEnginePort)
	}
	if cfg.DatabaseURL != "postgres://user:pass@localhost:5432/db?sslmode=disable" {
		t.Fatalf("unexpected DATABASE_URL %q", cfg.DatabaseURL)
	}
	if cfg.RedisURL != "redis://localhost:6380" {
		t.Fatalf("unexpected REDIS_URL %q", cfg.RedisURL)
	}
}
