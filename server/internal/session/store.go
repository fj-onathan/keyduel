package session

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	sessionPrefix = "session:"
	sessionTTL    = 7 * 24 * time.Hour // 7 days
)

// Session represents a user session stored in Redis.
type Session struct {
	UserID    string    `json:"user_id"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
}

// Store manages user sessions in Redis.
type Store struct {
	rdb *redis.Client
}

// NewStore creates a new session store backed by Redis.
func NewStore(rdb *redis.Client) *Store {
	return &Store{rdb: rdb}
}

// Create generates a new session for the given user ID and stores it in Redis.
// Returns the session ID (a cryptographic random 32-byte hex string).
func (s *Store) Create(ctx context.Context, userID string) (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("generate session id: %w", err)
	}
	sessionID := hex.EncodeToString(b)

	now := time.Now().UTC()
	sess := Session{
		UserID:    userID,
		CreatedAt: now,
		ExpiresAt: now.Add(sessionTTL),
	}

	data, err := json.Marshal(sess)
	if err != nil {
		return "", fmt.Errorf("marshal session: %w", err)
	}

	key := sessionPrefix + sessionID
	if err := s.rdb.Set(ctx, key, data, sessionTTL).Err(); err != nil {
		return "", fmt.Errorf("store session: %w", err)
	}

	return sessionID, nil
}

// Get retrieves a session by its ID. Returns an error if the session
// does not exist or has expired.
func (s *Store) Get(ctx context.Context, sessionID string) (Session, error) {
	key := sessionPrefix + sessionID

	data, err := s.rdb.Get(ctx, key).Bytes()
	if err == redis.Nil {
		return Session{}, fmt.Errorf("session not found")
	}
	if err != nil {
		return Session{}, fmt.Errorf("get session: %w", err)
	}

	var sess Session
	if err := json.Unmarshal(data, &sess); err != nil {
		return Session{}, fmt.Errorf("unmarshal session: %w", err)
	}

	return sess, nil
}

// Delete removes a session from Redis (logout).
func (s *Store) Delete(ctx context.Context, sessionID string) error {
	key := sessionPrefix + sessionID
	if err := s.rdb.Del(ctx, key).Err(); err != nil {
		return fmt.Errorf("delete session: %w", err)
	}
	return nil
}
