package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/fj-onathan/keyduel/server/internal/bot"
	"github.com/fj-onathan/keyduel/server/internal/cache"
	"github.com/fj-onathan/keyduel/server/internal/db"
)

func main() {
	cfg := bot.LoadConfig()

	if !cfg.Enabled {
		log.Println("[bot-runner] BOT_ENABLED is false, exiting.")
		os.Exit(0)
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	// Connect to PostgreSQL to load bot identities.
	connectCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	postgresPool, err := db.NewPostgresPool(connectCtx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("[bot-runner] postgres connection failed: %v", err)
	}
	defer postgresPool.Close()

	// Connect to Redis for admin toggle and queue-fill pub/sub.
	redisClient, err := cache.NewRedisClient(connectCtx, cfg.RedisURL)
	if err != nil {
		log.Fatalf("[bot-runner] redis connection failed: %v", err)
	}
	defer func() {
		_ = redisClient.Close()
	}()

	// Load bot identities from database.
	identities, err := bot.LoadIdentities(ctx, postgresPool)
	if err != nil {
		log.Fatalf("[bot-runner] failed to load identities: %v", err)
	}

	if len(identities) == 0 {
		log.Println("[bot-runner] no bot identities found in database. Run 'make seed-bots' first.")
		os.Exit(1)
	}

	log.Printf("[bot-runner] started, %d identities loaded", len(identities))

	// Start the bot manager.
	manager := bot.NewManager(cfg, identities, redisClient)
	manager.Run(ctx)

	log.Println("[bot-runner] shutdown complete")
}
