package auth

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/fj-onathan/keyduel/server/internal/config"
	"github.com/fj-onathan/keyduel/server/internal/session"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

const (
	oauthStatePrefix  = "oauth_state:"
	oauthStateTTL     = 5 * time.Minute
	sessionCookieName = "session_id"
	sessionMaxAge     = 7 * 24 * 60 * 60 // 7 days in seconds
)

// Handler handles all authentication routes.
type Handler struct {
	db   *pgxpool.Pool
	rdb  *redis.Client
	sess *session.Store
	cfg  config.Config
}

// NewHandler creates a new auth handler.
func NewHandler(db *pgxpool.Pool, rdb *redis.Client, sess *session.Store, cfg config.Config) *Handler {
	return &Handler{db: db, rdb: rdb, sess: sess, cfg: cfg}
}

// RegisterRoutes registers all auth routes on the given mux.
func (h *Handler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/auth/github", h.handleGitHubLogin)
	mux.HandleFunc("/auth/github/callback", h.handleGitHubCallback)
	mux.HandleFunc("/auth/me", h.handleMe)
	mux.HandleFunc("/auth/logout", h.handleLogout)
}

// handleGitHubLogin redirects the user to GitHub's OAuth authorization page.
func (h *Handler) handleGitHubLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Generate cryptographic random state token.
	stateBytes := make([]byte, 16)
	if _, err := rand.Read(stateBytes); err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	state := hex.EncodeToString(stateBytes)

	// Embed guest_id in the state payload for later linking.
	guestID := strings.TrimSpace(r.URL.Query().Get("guest_id"))
	statePayload := map[string]string{
		"state":    state,
		"guest_id": guestID,
	}
	payloadBytes, _ := json.Marshal(statePayload)

	// Store state in Redis with 5-minute TTL.
	key := oauthStatePrefix + state
	if err := h.rdb.Set(r.Context(), key, payloadBytes, oauthStateTTL).Err(); err != nil {
		log.Printf("auth: failed to store oauth state: %v", err)
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	// Build GitHub authorization URL.
	params := url.Values{
		"client_id":    {h.cfg.GitHubClientID},
		"redirect_uri": {h.cfg.GitHubCallbackURL},
		"scope":        {"user:email"},
		"state":        {state},
	}
	authURL := "https://github.com/login/oauth/authorize?" + params.Encode()

	http.Redirect(w, r, authURL, http.StatusTemporaryRedirect)
}

// handleGitHubCallback handles the OAuth callback from GitHub.
func (h *Handler) handleGitHubCallback(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	code := r.URL.Query().Get("code")
	state := r.URL.Query().Get("state")

	if code == "" || state == "" {
		h.redirectWithError(w, r, "missing code or state")
		return
	}

	// Validate state against Redis.
	key := oauthStatePrefix + state
	payloadBytes, err := h.rdb.Get(r.Context(), key).Bytes()
	if err == redis.Nil {
		h.redirectWithError(w, r, "invalid or expired state")
		return
	}
	if err != nil {
		h.redirectWithError(w, r, "internal error")
		return
	}
	// Delete state immediately (single-use).
	h.rdb.Del(r.Context(), key)

	var statePayload map[string]string
	_ = json.Unmarshal(payloadBytes, &statePayload)
	guestID := statePayload["guest_id"]

	// Exchange code for access token.
	accessToken, err := h.exchangeCodeForToken(r.Context(), code)
	if err != nil {
		log.Printf("auth: token exchange failed: %v", err)
		h.redirectWithError(w, r, "failed to authenticate with GitHub")
		return
	}

	// Fetch GitHub user profile.
	ghUser, err := h.fetchGitHubUser(r.Context(), accessToken)
	if err != nil {
		log.Printf("auth: failed to fetch github user: %v", err)
		h.redirectWithError(w, r, "failed to fetch GitHub profile")
		return
	}

	// Fetch primary email if not in profile.
	if ghUser.Email == "" {
		email, err := h.fetchGitHubPrimaryEmail(r.Context(), accessToken)
		if err != nil {
			log.Printf("auth: failed to fetch github email: %v", err)
			h.redirectWithError(w, r, "failed to fetch GitHub email")
			return
		}
		ghUser.Email = email
	}

	if ghUser.Email == "" {
		h.redirectWithError(w, r, "no email associated with GitHub account")
		return
	}

	// Upsert user and profile.
	userID, err := h.upsertUser(r.Context(), ghUser)
	if err != nil {
		log.Printf("auth: failed to upsert user: %v", err)
		h.redirectWithError(w, r, "failed to create account")
		return
	}

	// Link guest data if guest_id was provided.
	if guestID != "" {
		if err := h.linkGuestData(r.Context(), userID, guestID); err != nil {
			log.Printf("auth: failed to link guest data (non-fatal): %v", err)
		}
	}

	// Create session.
	sessionID, err := h.sess.Create(r.Context(), userID)
	if err != nil {
		log.Printf("auth: failed to create session: %v", err)
		h.redirectWithError(w, r, "failed to create session")
		return
	}

	// Set session cookie.
	secure := h.cfg.AppEnv != "development"
	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    sessionID,
		Path:     "/",
		Domain:   h.cfg.CookieDomain,
		MaxAge:   sessionMaxAge,
		HttpOnly: true,
		Secure:   secure,
		SameSite: http.SameSiteLaxMode,
	})

	// Redirect to frontend with success indicator.
	redirectURL := h.cfg.FrontendURL + "?login=success"
	http.Redirect(w, r, redirectURL, http.StatusTemporaryRedirect)
}

// handleMe returns the currently authenticated user's profile.
func (h *Handler) handleMe(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]any{
			"error": map[string]any{"code": "method_not_allowed", "message": "only GET is supported"},
		})
		return
	}

	userID, ok := UserIDFromContext(r.Context())
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]any{
			"error": map[string]any{"code": "unauthorized", "message": "not authenticated"},
		})
		return
	}

	var (
		email        string
		username     string
		displayName  string
		avatarURL    sql.NullString
		countryCode  sql.NullString
		headline     sql.NullString
		bio          sql.NullString
		websiteURL   sql.NullString
		location     sql.NullString
		authProvider string
		createdAt    time.Time
	)

	err := h.db.QueryRow(r.Context(), `
SELECT
  u.email,
  p.username,
  COALESCE(NULLIF(p.display_name, ''), p.username) AS display_name,
  p.avatar_url,
  p.country_code,
  p.headline,
  p.bio,
  p.website_url,
  p.location,
  u.auth_provider,
  u.created_at
FROM users u
JOIN profiles p ON p.user_id = u.id
WHERE u.id = $1
`, userID).Scan(
		&email, &username, &displayName, &avatarURL, &countryCode,
		&headline, &bio, &websiteURL, &location, &authProvider, &createdAt,
	)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]any{
			"error": map[string]any{"code": "user_not_found", "message": "user not found"},
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"user": map[string]any{
			"id":           userID,
			"email":        email,
			"authProvider": authProvider,
			"createdAt":    createdAt,
		},
		"profile": map[string]any{
			"username":    username,
			"displayName": displayName,
			"avatarUrl":   avatarURL.String,
			"countryCode": countryCode.String,
			"headline":    headline.String,
			"bio":         bio.String,
			"websiteUrl":  websiteURL.String,
			"location":    location.String,
		},
	})
}

// handleLogout destroys the session and clears the cookie.
func (h *Handler) handleLogout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]any{
			"error": map[string]any{"code": "method_not_allowed", "message": "only POST is supported"},
		})
		return
	}

	cookie, err := r.Cookie(sessionCookieName)
	if err == nil && cookie.Value != "" {
		_ = h.sess.Delete(r.Context(), cookie.Value)
	}

	// Clear the cookie.
	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    "",
		Path:     "/",
		Domain:   h.cfg.CookieDomain,
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   h.cfg.AppEnv != "development",
		SameSite: http.SameSiteLaxMode,
	})

	writeJSON(w, http.StatusOK, map[string]any{"message": "logged out"})
}

// --- GitHub API helpers ---

type gitHubUser struct {
	ID        int64  `json:"id"`
	Login     string `json:"login"`
	Email     string `json:"email"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatar_url"`
}

func (h *Handler) exchangeCodeForToken(ctx context.Context, code string) (string, error) {
	data := url.Values{
		"client_id":     {h.cfg.GitHubClientID},
		"client_secret": {h.cfg.GitHubClientSecret},
		"code":          {code},
		"redirect_uri":  {h.cfg.GitHubCallbackURL},
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		"https://github.com/login/oauth/access_token", strings.NewReader(data.Encode()))
	if err != nil {
		return "", fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("http request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("read body: %w", err)
	}

	var tokenResp struct {
		AccessToken string `json:"access_token"`
		TokenType   string `json:"token_type"`
		Error       string `json:"error"`
		ErrorDesc   string `json:"error_description"`
	}
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return "", fmt.Errorf("decode response: %w", err)
	}

	if tokenResp.Error != "" {
		return "", fmt.Errorf("github oauth error: %s: %s", tokenResp.Error, tokenResp.ErrorDesc)
	}

	if tokenResp.AccessToken == "" {
		return "", fmt.Errorf("empty access token")
	}

	return tokenResp.AccessToken, nil
}

func (h *Handler) fetchGitHubUser(ctx context.Context, accessToken string) (gitHubUser, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "https://api.github.com/user", nil)
	if err != nil {
		return gitHubUser{}, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/vnd.github+json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return gitHubUser{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return gitHubUser{}, fmt.Errorf("github api returned %d", resp.StatusCode)
	}

	var user gitHubUser
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return gitHubUser{}, err
	}
	return user, nil
}

func (h *Handler) fetchGitHubPrimaryEmail(ctx context.Context, accessToken string) (string, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "https://api.github.com/user/emails", nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/vnd.github+json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("github emails api returned %d", resp.StatusCode)
	}

	var emails []struct {
		Email    string `json:"email"`
		Primary  bool   `json:"primary"`
		Verified bool   `json:"verified"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&emails); err != nil {
		return "", err
	}

	// Prefer primary+verified, then any verified, then first.
	for _, e := range emails {
		if e.Primary && e.Verified {
			return e.Email, nil
		}
	}
	for _, e := range emails {
		if e.Verified {
			return e.Email, nil
		}
	}
	if len(emails) > 0 {
		return emails[0].Email, nil
	}

	return "", fmt.Errorf("no emails found")
}

// --- Database operations ---

func (h *Handler) upsertUser(ctx context.Context, ghUser gitHubUser) (string, error) {
	var userID string

	// Try to find by github_id first.
	err := h.db.QueryRow(ctx, `
SELECT id::text FROM users WHERE github_id = $1
`, ghUser.ID).Scan(&userID)

	if err == nil {
		// Existing user — update avatar and last login.
		_, _ = h.db.Exec(ctx, `
UPDATE users SET updated_at = NOW() WHERE id = $1
`, userID)
		if ghUser.AvatarURL != "" {
			_, _ = h.db.Exec(ctx, `
UPDATE profiles SET avatar_url = $1, updated_at = NOW() WHERE user_id = $2
`, ghUser.AvatarURL, userID)
		}
		return userID, nil
	}

	// Try to find by email (user may have been created as synthetic).
	err = h.db.QueryRow(ctx, `
SELECT id::text FROM users WHERE email = $1
`, ghUser.Email).Scan(&userID)

	if err == nil {
		// Link the GitHub ID to the existing user.
		_, _ = h.db.Exec(ctx, `
UPDATE users SET github_id = $1, auth_provider = 'github', updated_at = NOW()
WHERE id = $2
`, ghUser.ID, userID)
		if ghUser.AvatarURL != "" {
			_, _ = h.db.Exec(ctx, `
UPDATE profiles SET avatar_url = $1, updated_at = NOW() WHERE user_id = $2
`, ghUser.AvatarURL, userID)
		}
		return userID, nil
	}

	// New user — create user and profile in a transaction.
	tx, err := h.db.Begin(ctx)
	if err != nil {
		return "", fmt.Errorf("begin tx: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	err = tx.QueryRow(ctx, `
INSERT INTO users (email, password_hash, github_id, auth_provider)
VALUES ($1, NULL, $2, 'github')
RETURNING id::text
`, ghUser.Email, ghUser.ID).Scan(&userID)
	if err != nil {
		return "", fmt.Errorf("insert user: %w", err)
	}

	// Determine username — try GitHub login, fall back to github_<id>.
	username := ghUser.Login
	if username == "" {
		username = fmt.Sprintf("github_%d", ghUser.ID)
	}

	// Ensure username uniqueness by appending a suffix if needed.
	baseUsername := username
	for attempt := 0; attempt < 5; attempt++ {
		var exists bool
		_ = tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM profiles WHERE LOWER(username) = LOWER($1))`, username).Scan(&exists)
		if !exists {
			break
		}
		suffix := make([]byte, 3)
		_, _ = rand.Read(suffix)
		username = baseUsername + "-" + hex.EncodeToString(suffix)
	}

	displayName := ghUser.Name
	if displayName == "" {
		displayName = ghUser.Login
	}

	_, err = tx.Exec(ctx, `
INSERT INTO profiles (user_id, username, display_name, avatar_url)
VALUES ($1, $2, $3, $4)
`, userID, username, displayName, ghUser.AvatarURL)
	if err != nil {
		return "", fmt.Errorf("insert profile: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return "", fmt.Errorf("commit tx: %w", err)
	}

	return userID, nil
}

// linkGuestData migrates race data from a synthetic guest user to the real user.
func (h *Handler) linkGuestData(ctx context.Context, realUserID string, guestID string) error {
	// The synthetic user email pattern is: <guestId>@race.local
	syntheticEmail := guestID + "@race.local"

	var syntheticUserID string
	err := h.db.QueryRow(ctx, `
SELECT id::text FROM users WHERE email = $1
`, syntheticEmail).Scan(&syntheticUserID)
	if err != nil {
		// No synthetic user found — nothing to link.
		return nil
	}

	if syntheticUserID == realUserID {
		// Same user — nothing to do.
		return nil
	}

	tx, err := h.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	// Move race_participants from synthetic to real user.
	// Use ON CONFLICT to skip if the real user already participated in the same race.
	_, err = tx.Exec(ctx, `
UPDATE race_participants
SET user_id = $1
WHERE user_id = $2
  AND race_id NOT IN (
    SELECT race_id FROM race_participants WHERE user_id = $1
  )
`, realUserID, syntheticUserID)
	if err != nil {
		return fmt.Errorf("transfer race_participants: %w", err)
	}

	// Move leaderboard_entries.
	_, err = tx.Exec(ctx, `
DELETE FROM leaderboard_entries WHERE user_id = $1
`, syntheticUserID)
	if err != nil {
		return fmt.Errorf("delete synthetic leaderboard: %w", err)
	}

	// Delete remaining race_participants for the synthetic user (duplicates).
	_, _ = tx.Exec(ctx, `
DELETE FROM race_participants WHERE user_id = $1
`, syntheticUserID)

	// Delete synthetic profile and user.
	_, _ = tx.Exec(ctx, `DELETE FROM profiles WHERE user_id = $1`, syntheticUserID)
	_, _ = tx.Exec(ctx, `DELETE FROM users WHERE id = $1`, syntheticUserID)

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit tx: %w", err)
	}

	return nil
}

// --- Helpers ---

func (h *Handler) redirectWithError(w http.ResponseWriter, r *http.Request, msg string) {
	redirectURL := h.cfg.FrontendURL + "?login=error&message=" + url.QueryEscape(msg)
	http.Redirect(w, r, redirectURL, http.StatusTemporaryRedirect)
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
