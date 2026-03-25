package auth

import (
	"context"
	"net/http"
	"net/url"

	"github.com/fj-onathan/keyduel/server/internal/session"
)

type contextKey string

const userIDKey contextKey = "userID"

// OptionalAuth is middleware that reads the session cookie and, if valid,
// attaches the user ID to the request context. If the cookie is missing
// or the session is invalid, the request continues without a user context.
func OptionalAuth(sess *session.Store) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie(sessionCookieName)
			if err != nil || cookie.Value == "" {
				next.ServeHTTP(w, r)
				return
			}

			s, err := sess.Get(r.Context(), cookie.Value)
			if err != nil {
				// Invalid or expired session — continue as guest.
				next.ServeHTTP(w, r)
				return
			}

			ctx := context.WithValue(r.Context(), userIDKey, s.UserID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireAuth is middleware that returns 401 if there is no valid session.
func RequireAuth(sess *session.Store) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie(sessionCookieName)
			if err != nil || cookie.Value == "" {
				writeJSON(w, http.StatusUnauthorized, map[string]any{
					"error": map[string]any{"code": "unauthorized", "message": "authentication required"},
				})
				return
			}

			s, err := sess.Get(r.Context(), cookie.Value)
			if err != nil {
				writeJSON(w, http.StatusUnauthorized, map[string]any{
					"error": map[string]any{"code": "unauthorized", "message": "invalid or expired session"},
				})
				return
			}

			ctx := context.WithValue(r.Context(), userIDKey, s.UserID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// CSRFProtect is middleware that validates the Origin header on state-mutating
// requests (POST, PUT, PATCH, DELETE). It rejects cross-origin requests that
// don't match the allowed origins, providing CSRF protection beyond SameSite cookies.
// GET, HEAD, and OPTIONS are always allowed through (they should be side-effect-free).
func CSRFProtect(allowedOrigins ...string) func(http.Handler) http.Handler {
	// Pre-parse allowed origins to extract just scheme+host (ignore path).
	allowed := make(map[string]bool, len(allowedOrigins))
	for _, origin := range allowedOrigins {
		parsed, err := url.Parse(origin)
		if err == nil && parsed.Scheme != "" && parsed.Host != "" {
			allowed[parsed.Scheme+"://"+parsed.Host] = true
		}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Safe methods are always allowed.
			if r.Method == http.MethodGet || r.Method == http.MethodHead || r.Method == http.MethodOptions {
				next.ServeHTTP(w, r)
				return
			}

			origin := r.Header.Get("Origin")
			if origin == "" {
				// No Origin header — could be a same-origin request from a non-CORS
				// context (e.g., form submission, curl). Allow it; SameSite cookie
				// already prevents cross-site cookie attachment in most browsers.
				next.ServeHTTP(w, r)
				return
			}

			if allowed[origin] {
				next.ServeHTTP(w, r)
				return
			}

			writeJSON(w, http.StatusForbidden, map[string]any{
				"error": map[string]any{"code": "csrf_rejected", "message": "cross-origin request blocked"},
			})
		})
	}
}

// UserIDFromContext extracts the authenticated user ID from the request context.
func UserIDFromContext(ctx context.Context) (string, bool) {
	id, ok := ctx.Value(userIDKey).(string)
	return id, ok && id != ""
}
