package auth

import (
	"net/http"
	"sync"
	"time"
)

// RateLimiter implements a per-IP token bucket rate limiter for auth endpoints.
type RateLimiter struct {
	mu      sync.Mutex
	clients map[string]*bucket
	rate    int           // tokens added per interval
	burst   int           // max tokens (bucket capacity)
	window  time.Duration // refill interval
}

type bucket struct {
	tokens   int
	lastSeen time.Time
}

// NewRateLimiter creates a rate limiter that allows `rate` requests per `window`,
// with a burst capacity of `burst`.
func NewRateLimiter(rate int, burst int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		clients: make(map[string]*bucket),
		rate:    rate,
		burst:   burst,
		window:  window,
	}
	// Periodically clean up stale entries.
	go rl.cleanup()
	return rl
}

// Middleware returns an HTTP middleware that rate limits all requests by IP.
func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := extractIP(r)
		if !rl.allow(ip) {
			w.Header().Set("Retry-After", "60")
			writeJSON(w, http.StatusTooManyRequests, map[string]any{
				"error": map[string]any{
					"code":    "rate_limited",
					"message": "too many requests, please try again later",
				},
			})
			return
		}
		next.ServeHTTP(w, r)
	})
}

// PathPrefixMiddleware returns an HTTP middleware that rate limits only
// requests whose path starts with the given prefix (e.g. "/auth/").
// Requests that don't match the prefix pass through without rate limiting.
func (rl *RateLimiter) PathPrefixMiddleware(prefix string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if len(r.URL.Path) >= len(prefix) && r.URL.Path[:len(prefix)] == prefix {
				ip := extractIP(r)
				if !rl.allow(ip) {
					w.Header().Set("Retry-After", "60")
					writeJSON(w, http.StatusTooManyRequests, map[string]any{
						"error": map[string]any{
							"code":    "rate_limited",
							"message": "too many requests, please try again later",
						},
					})
					return
				}
			}
			next.ServeHTTP(w, r)
		})
	}
}

func (rl *RateLimiter) allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	b, exists := rl.clients[key]
	if !exists {
		rl.clients[key] = &bucket{tokens: rl.burst - 1, lastSeen: now}
		return true
	}

	// Refill tokens based on elapsed time.
	elapsed := now.Sub(b.lastSeen)
	refill := int(elapsed/rl.window) * rl.rate
	if refill > 0 {
		b.tokens += refill
		if b.tokens > rl.burst {
			b.tokens = rl.burst
		}
		b.lastSeen = now
	}

	if b.tokens <= 0 {
		return false
	}

	b.tokens--
	return true
}

func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		rl.mu.Lock()
		cutoff := time.Now().Add(-10 * time.Minute)
		for key, b := range rl.clients {
			if b.lastSeen.Before(cutoff) {
				delete(rl.clients, key)
			}
		}
		rl.mu.Unlock()
	}
}

func extractIP(r *http.Request) string {
	// Check common reverse-proxy headers.
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		// Take the first IP (client IP).
		for i := 0; i < len(xff); i++ {
			if xff[i] == ',' {
				return xff[:i]
			}
		}
		return xff
	}
	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return xri
	}
	// Fall back to RemoteAddr (strip port).
	addr := r.RemoteAddr
	for i := len(addr) - 1; i >= 0; i-- {
		if addr[i] == ':' {
			return addr[:i]
		}
	}
	return addr
}
