package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/fj-onathan/keyduel/server/internal/cache"
	"github.com/fj-onathan/keyduel/server/internal/config"
	"github.com/fj-onathan/keyduel/server/internal/db"
	"github.com/fj-onathan/keyduel/server/internal/race"
	"github.com/fj-onathan/keyduel/server/internal/session"
	"github.com/fj-onathan/keyduel/server/internal/transport/ws"
)

func main() {
	cfg := config.Load()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	connectCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	redisClient, err := cache.NewRedisClient(connectCtx, cfg.RedisURL)
	if err != nil {
		log.Fatalf("redis connection failed: %v", err)
	}
	defer func() {
		_ = redisClient.Close()
	}()

	postgresPool, err := db.NewPostgresPool(connectCtx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("postgres connection failed: %v", err)
	}
	defer postgresPool.Close()

	// Create session store for reading auth cookies on WS upgrade.
	sessionStore := session.NewStore(redisClient)

	mux := http.NewServeMux()
	hub := ws.NewHub()
	hub.SetRacePersistence(race.NewPersistence(postgresPool, redisClient))
	hub.SetSnippetProvider(race.NewSnippetProvider(postgresPool))
	hub.SetRedisClient(redisClient)
	hub.StartRoomStateBroadcast(100 * time.Millisecond)
	hub.StartCleanupSweep(2 * time.Second)
	hub.StartOnlineCountPublisher(redisClient, 5*time.Second)
	mux.HandleFunc("/ws", ws.NewHandler(hub, sessionStore, postgresPool))
	mux.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	mux.HandleFunc("/api/races/find-or-create", corsMiddleware(cfg.CORSOrigin, handleFindOrCreateRace(hub)))
	mux.HandleFunc("/api/races/info/", corsMiddleware(cfg.CORSOrigin, handleRaceInfo(hub)))
	mux.HandleFunc("/api/stats/online", corsMiddleware(cfg.CORSOrigin, handleOnlineCount(hub)))

	server := &http.Server{
		Addr:              ":" + cfg.RaceEnginePort,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		<-ctx.Done()
		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer shutdownCancel()
		if err := server.Shutdown(shutdownCtx); err != nil {
			log.Printf("race-engine shutdown error: %v", err)
		}
	}()

	log.Printf("race-engine listening on :%s", cfg.RaceEnginePort)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("race-engine failed: %v", err)
	}
}

func corsMiddleware(origin string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Cookie")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next(w, r)
	}
}

type findOrCreateRequest struct {
	Hub      string `json:"hub"`
	Mode     string `json:"mode"`
	Capacity int    `json:"capacity"`
}

type findOrCreateResponse struct {
	RaceID string `json:"raceId"`
	RoomID string `json:"roomId"`
	Hub    string `json:"hub"`
}

func handleFindOrCreateRace(hub *ws.Hub) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, `{"error":{"message":"method not allowed"}}`, http.StatusMethodNotAllowed)
			return
		}

		var req findOrCreateRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error":{"message":"invalid request body"}}`, http.StatusBadRequest)
			return
		}

		if req.Hub == "" {
			http.Error(w, `{"error":{"message":"hub is required"}}`, http.StatusBadRequest)
			return
		}

		raceID, roomID := hub.FindOrCreateWaitingRoom(req.Hub, req.Mode, req.Capacity)

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(findOrCreateResponse{
			RaceID: raceID,
			RoomID: roomID,
			Hub:    req.Hub,
		})
	}
}

func handleOnlineCount(hub *ws.Hub) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, `{"error":{"message":"method not allowed"}}`, http.StatusMethodNotAllowed)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]int{
			"onlinePlayers": hub.Count(),
		})
	}
}

func handleRaceInfo(hub *ws.Hub) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, `{"error":{"message":"method not allowed"}}`, http.StatusMethodNotAllowed)
			return
		}

		raceID := strings.TrimPrefix(r.URL.Path, "/api/races/info/")
		raceID = strings.TrimSpace(strings.Trim(raceID, "/"))
		if raceID == "" {
			http.Error(w, `{"error":{"message":"race id is required"}}`, http.StatusBadRequest)
			return
		}

		participants, status, snippetLen, ok := hub.GetRaceInfo(raceID)
		if !ok {
			http.Error(w, `{"error":{"message":"race not found"}}`, http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"raceId":       raceID,
			"status":       status,
			"snippetLen":   snippetLen,
			"participants": participants,
		})
	}
}
