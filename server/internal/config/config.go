package config

import "os"

type Config struct {
	AppEnv         string
	APIPort        string
	RaceEnginePort string
	DatabaseURL    string
	RedisURL       string
	CORSOrigin     string

	// GitHub OAuth
	GitHubClientID     string
	GitHubClientSecret string
	GitHubCallbackURL  string

	// Sessions
	SessionSecret string
	CookieDomain  string

	// Frontend
	FrontendURL string
}

func Load() Config {
	return Config{
		AppEnv:         getEnv("APP_ENV", "development"),
		APIPort:        getEnv("API_PORT", "8080"),
		RaceEnginePort: getEnv("RACE_ENGINE_PORT", "8081"),
		DatabaseURL:    getEnv("DATABASE_URL", "postgres://typing_game:typing_game@localhost:5432/typing_game?sslmode=disable"),
		RedisURL:       getEnv("REDIS_URL", "redis://localhost:6379"),
		CORSOrigin:     getEnv("CORS_ORIGIN", "http://localhost:5173"),

		GitHubClientID:     getEnv("GITHUB_CLIENT_ID", ""),
		GitHubClientSecret: getEnv("GITHUB_CLIENT_SECRET", ""),
		GitHubCallbackURL:  getEnv("GITHUB_CALLBACK_URL", "http://localhost:8080/auth/github/callback"),

		SessionSecret: getEnv("SESSION_SECRET", "replace_me_with_random_32_bytes"),
		CookieDomain:  getEnv("COOKIE_DOMAIN", ""),

		FrontendURL: getEnv("FRONTEND_URL", "http://localhost:5173"),
	}
}

func getEnv(key string, fallback string) string {
	value, ok := os.LookupEnv(key)
	if !ok || value == "" {
		return fallback
	}

	return value
}
