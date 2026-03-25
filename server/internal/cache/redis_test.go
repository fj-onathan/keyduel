package cache

import (
	"context"
	"testing"
	"time"
)

func TestNewRedisClientInvalidURL(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	_, err := NewRedisClient(ctx, "://invalid-url")
	if err == nil {
		t.Fatal("expected error for invalid redis URL")
	}
}
