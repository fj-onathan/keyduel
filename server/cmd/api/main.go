package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/fj-onathan/keyduel/server/internal/api"
	"github.com/fj-onathan/keyduel/server/internal/auth"
	"github.com/fj-onathan/keyduel/server/internal/cache"
	"github.com/fj-onathan/keyduel/server/internal/config"
	"github.com/fj-onathan/keyduel/server/internal/db"
	"github.com/fj-onathan/keyduel/server/internal/session"
)

func withCORS(next http.Handler, allowedOrigin string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" && (allowedOrigin == "*" || origin == allowedOrigin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-User-Email")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	cfg := config.Load()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	connectCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	postgresPool, err := db.NewPostgresPool(connectCtx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("postgres connection failed: %v", err)
	}
	defer postgresPool.Close()

	redisClient, err := cache.NewRedisClient(connectCtx, cfg.RedisURL)
	if err != nil {
		log.Fatalf("redis connection failed: %v", err)
	}
	defer func() {
		_ = redisClient.Close()
	}()

	mux := http.NewServeMux()

	// Session store (Redis-backed).
	sessStore := session.NewStore(redisClient)

	// Auth handler — GitHub OAuth, /auth/me, /auth/logout.
	authHandler := auth.NewHandler(postgresPool, redisClient, sessStore, cfg)
	authHandler.RegisterRoutes(mux)

	// API routes.
	apiServer := api.NewServer(postgresPool, redisClient, cfg)
	apiServer.RegisterRoutes(mux)

	// User management routes (require auth).
	apiServer.RegisterProtectedRoutes(mux, sessStore)

	mux.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"status":  "ok",
			"service": "api",
			"env":     cfg.AppEnv,
		})
	})

	// Rate limiter for auth endpoints: 10 requests per minute, burst of 15.
	authRateLimiter := auth.NewRateLimiter(10, 15, time.Minute)

	// General rate limiter for all API routes: 60 requests per minute, burst of 80.
	apiRateLimiter := auth.NewRateLimiter(60, 80, time.Minute)

	// CSRF protection: validate Origin header on mutating requests.
	csrfProtect := auth.CSRFProtect(cfg.FrontendURL, cfg.CORSOrigin)

	// Middleware chain (outermost first):
	// CORS → General Rate Limit → Auth Rate Limit (/auth/* only) → CSRF → OptionalAuth → mux
	handler := withCORS(
		apiRateLimiter.Middleware(
			authRateLimiter.PathPrefixMiddleware("/auth/")(
				csrfProtect(
					auth.OptionalAuth(sessStore)(mux),
				),
			),
		),
		cfg.CORSOrigin,
	)

	server := &http.Server{
		Addr:              ":" + cfg.APIPort,
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		<-ctx.Done()
		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer shutdownCancel()
		if err := server.Shutdown(shutdownCtx); err != nil {
			log.Printf("api shutdown error: %v", err)
		}
	}()

	log.Printf("api listening on :%s", cfg.APIPort)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("api failed: %v", err)
	}
}
