package db

import (
	"context"
	"testing"
	"time"
)

func TestNewPostgresPoolInvalidURL(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	_, err := NewPostgresPool(ctx, "://invalid-url")
	if err == nil {
		t.Fatal("expected error for invalid database URL")
	}
}
