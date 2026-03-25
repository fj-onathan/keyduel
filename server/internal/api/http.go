package api

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/fj-onathan/keyduel/server/internal/auth"
	"github.com/fj-onathan/keyduel/server/internal/config"
	"github.com/fj-onathan/keyduel/server/internal/session"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type Server struct {
	db    *pgxpool.Pool
	cache *redis.Client
	cfg   config.Config
}

func NewServer(db *pgxpool.Pool, cache *redis.Client, cfg config.Config) *Server {
	return &Server{db: db, cache: cache, cfg: cfg}
}

func (s *Server) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/hubs", s.handleHubs)
	mux.HandleFunc("/leaderboard", s.handleLeaderboard)
	mux.HandleFunc("/leaderboard/", s.handleLeaderboard)
	mux.HandleFunc("/social/rivals", s.handleSocialRivals)
	mux.HandleFunc("/profile/me/races", s.handleProfileRaces)
	mux.HandleFunc("/profile/", s.handleProfileByUsername)
	mux.HandleFunc("/races/", s.handleRaceDetail)
	mux.HandleFunc("/snippets/random", s.handleSnippetRandom)
	mux.HandleFunc("/platform-stats", s.handlePlatformStats)
}

// RegisterProtectedRoutes registers routes that require authentication.
// These are wrapped with RequireAuth middleware.
func (s *Server) RegisterProtectedRoutes(mux *http.ServeMux, sessStore *session.Store) {
	requireAuth := auth.RequireAuth(sessStore)

	mux.Handle("/api/me/races", requireAuth(http.HandlerFunc(s.handleMyRaces)))
	mux.Handle("/api/me/hub-stats", requireAuth(http.HandlerFunc(s.handleMyHubStats)))
	mux.Handle("/api/me/account", requireAuth(http.HandlerFunc(s.handleMyAccount)))
}

func (s *Server) handleProfileByUsername(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "only GET is supported")
		return
	}

	profilePath := strings.TrimSpace(strings.TrimPrefix(r.URL.Path, "/profile/"))
	profilePath = strings.Trim(profilePath, "/")
	if profilePath == "" {
		writeError(w, http.StatusNotFound, "profile_not_found", "profile not found")
		return
	}

	segments := strings.Split(profilePath, "/")
	username := strings.TrimSpace(segments[0])
	if username == "" {
		writeError(w, http.StatusNotFound, "profile_not_found", "profile not found")
		return
	}

	if len(segments) == 1 {
		s.handleProfileOverview(w, r, username)
		return
	}

	if len(segments) == 2 {
		switch segments[1] {
		case "activity":
			s.handleProfileActivity(w, r, username)
			return
		case "achievements":
			s.handleProfileAchievements(w, r, username)
			return
		}
	}

	writeError(w, http.StatusNotFound, "profile_not_found", "profile not found")
}

func (s *Server) handleProfileOverview(w http.ResponseWriter, r *http.Request, requestedUsername string) {
	usernamePath := requestedUsername

	var (
		userID        string
		email         string
		username      string
		displayName   string
		avatarURL     sql.NullString
		countryCode   sql.NullString
		headline      sql.NullString
		bio           sql.NullString
		websiteURL    sql.NullString
		location      sql.NullString
		skillsRaw     []byte
		curriculumRaw []byte
		joinedAt      time.Time
		racesPlayed   int
		wins          int
		bestNetWPM    float64
		avgAccuracy   float64
		bestStreak    int
	)

	err := s.db.QueryRow(r.Context(), `
WITH race_stats AS (
  SELECT
    COUNT(*)::int AS races_played,
    SUM(CASE WHEN rp.final_position = 1 THEN 1 ELSE 0 END)::int AS wins,
    COALESCE(MAX(rp.net_wpm), 0)::float8 AS best_net_wpm,
    COALESCE(AVG(rp.accuracy), 0)::float8 AS avg_accuracy
  FROM race_participants rp
  WHERE rp.user_id = (SELECT user_id FROM profiles WHERE LOWER(username) = LOWER($1) LIMIT 1)
),
race_days AS (
  SELECT DISTINCT date_trunc('day', r.created_at)::date AS race_day
  FROM race_participants rp
  JOIN races r ON r.id = rp.race_id
  WHERE rp.user_id = (SELECT user_id FROM profiles WHERE LOWER(username) = LOWER($1) LIMIT 1)
),
streak_groups AS (
  SELECT race_day, race_day - (ROW_NUMBER() OVER (ORDER BY race_day))::int AS grp
  FROM race_days
),
streak_stats AS (
  SELECT COALESCE(MAX(streak_len), 0)::int AS best_streak
  FROM (
    SELECT COUNT(*)::int AS streak_len
    FROM streak_groups
    GROUP BY grp
  ) grouped
)
SELECT
  u.id::text,
  u.email,
  p.username,
  COALESCE(NULLIF(p.display_name, ''), p.username) AS display_name,
  p.avatar_url,
  p.country_code,
  p.headline,
  p.bio,
  p.website_url,
  p.location,
  COALESCE(p.skills, '[]'::jsonb)::text,
  COALESCE(p.curriculum, '[]'::jsonb)::text,
  u.created_at,
  COALESCE(rs.races_played, 0),
  COALESCE(rs.wins, 0),
  COALESCE(rs.best_net_wpm, 0),
  COALESCE(rs.avg_accuracy, 0),
  COALESCE(ss.best_streak, 0)
FROM profiles p
JOIN users u ON u.id = p.user_id
LEFT JOIN race_stats rs ON TRUE
LEFT JOIN streak_stats ss ON TRUE
WHERE LOWER(p.username) = LOWER($1)
LIMIT 1
`, usernamePath).Scan(
		&userID,
		&email,
		&username,
		&displayName,
		&avatarURL,
		&countryCode,
		&headline,
		&bio,
		&websiteURL,
		&location,
		&skillsRaw,
		&curriculumRaw,
		&joinedAt,
		&racesPlayed,
		&wins,
		&bestNetWPM,
		&avgAccuracy,
		&bestStreak,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			writeError(w, http.StatusNotFound, "profile_not_found", "profile not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "db_query_failed", err.Error())
		return
	}

	if len(skillsRaw) == 0 {
		skillsRaw = []byte("[]")
	}
	if len(curriculumRaw) == 0 {
		curriculumRaw = []byte("[]")
	}

	var skills any
	if err := json.Unmarshal(skillsRaw, &skills); err != nil {
		skills = make([]any, 0)
	}

	var curriculum any
	if err := json.Unmarshal(curriculumRaw, &curriculum); err != nil {
		curriculum = make([]any, 0)
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"identity": map[string]any{
			"userId":      userID,
			"email":       email,
			"username":    username,
			"displayName": displayName,
			"avatarUrl":   avatarURL.String,
			"countryCode": countryCode.String,
			"headline":    headline.String,
			"bio":         bio.String,
			"websiteUrl":  websiteURL.String,
			"location":    location.String,
			"joinedAt":    joinedAt,
		},
		"summary": map[string]any{
			"racesPlayed": racesPlayed,
			"wins":        wins,
			"bestNetWpm":  bestNetWPM,
			"avgAccuracy": avgAccuracy,
			"bestStreak":  bestStreak,
		},
		"curriculum": map[string]any{
			"skills": skills,
			"items":  curriculum,
		},
	})
}

func (s *Server) handleProfileActivity(w http.ResponseWriter, r *http.Request, username string) {
	rawRange := strings.TrimSpace(strings.ToLower(r.URL.Query().Get("range")))
	days := profileRangeToDays(rawRange)

	rows, err := s.db.Query(r.Context(), `
WITH target AS (
  SELECT user_id
  FROM profiles
  WHERE LOWER(username) = LOWER($1)
  LIMIT 1
),
days AS (
  SELECT generate_series(
    (CURRENT_DATE - (($2::int - 1) * INTERVAL '1 day'))::date,
    CURRENT_DATE::date,
    INTERVAL '1 day'
  )::date AS day
),
activity AS (
  SELECT date_trunc('day', r.created_at)::date AS day, COUNT(*)::int AS races_count
  FROM race_participants rp
  JOIN races r ON r.id = rp.race_id
  JOIN target t ON t.user_id = rp.user_id
  WHERE r.created_at >= (CURRENT_DATE - (($2::int - 1) * INTERVAL '1 day'))
  GROUP BY 1
)
SELECT
  d.day,
  COALESCE(a.races_count, 0) AS races_count,
  EXISTS(SELECT 1 FROM target) AS profile_exists
FROM days d
LEFT JOIN activity a ON a.day = d.day
ORDER BY d.day ASC
`, username, days)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_query_failed", err.Error())
		return
	}
	defer rows.Close()

	type cell struct {
		Date  string `json:"date"`
		Count int    `json:"count"`
	}

	cells := make([]cell, 0, days)
	totalRaces := 0
	activeDays := 0
	currentStreak := 0
	longestStreak := 0
	runningStreak := 0
	profileExists := false

	for rows.Next() {
		var day time.Time
		var count int
		var exists bool
		if err := rows.Scan(&day, &count, &exists); err != nil {
			writeError(w, http.StatusInternalServerError, "db_scan_failed", err.Error())
			return
		}

		profileExists = exists
		totalRaces += count
		if count > 0 {
			activeDays++
			runningStreak++
			if runningStreak > longestStreak {
				longestStreak = runningStreak
			}
		} else {
			runningStreak = 0
		}

		cells = append(cells, cell{Date: day.Format("2006-01-02"), Count: count})
	}

	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "db_rows_failed", err.Error())
		return
	}

	if !profileExists {
		writeError(w, http.StatusNotFound, "profile_not_found", "profile not found")
		return
	}

	for i := len(cells) - 1; i >= 0; i-- {
		if cells[i].Count <= 0 {
			if currentStreak > 0 {
				break
			}
			continue
		}
		currentStreak++
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"username": username,
		"range":    rangeLabelForDays(days),
		"days":     days,
		"totals": map[string]any{
			"totalRaces":    totalRaces,
			"activeDays":    activeDays,
			"currentStreak": currentStreak,
			"longestStreak": longestStreak,
		},
		"cells": cells,
	})
}

func (s *Server) handleProfileAchievements(w http.ResponseWriter, r *http.Request, username string) {
	rows, err := s.db.Query(r.Context(), `
WITH target AS (
  SELECT user_id
  FROM profiles
  WHERE LOWER(username) = LOWER($1)
  LIMIT 1
),
monthly_hub_ranks AS (
  SELECT
    date_trunc('month', r.created_at)::date AS month_start,
    h.id AS hub_id,
    h.slug AS hub_slug,
    h.title AS hub_title,
    rp.user_id,
    SUM(CASE WHEN rp.final_position = 1 THEN 1 ELSE 0 END)::int AS wins,
    COALESCE(MAX(rp.net_wpm), 0)::float8 AS best_net_wpm,
    COALESCE(AVG(rp.accuracy), 0)::float8 AS avg_accuracy,
    ROW_NUMBER() OVER (
      PARTITION BY date_trunc('month', r.created_at)::date, h.id
      ORDER BY
        SUM(CASE WHEN rp.final_position = 1 THEN 1 ELSE 0 END) DESC,
        COALESCE(MAX(rp.net_wpm), 0) DESC,
        COALESCE(AVG(rp.accuracy), 0) DESC,
        rp.user_id
    ) AS rank
  FROM race_participants rp
  JOIN races r ON r.id = rp.race_id
  JOIN hubs h ON h.id = r.hub_id
  WHERE r.created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '12 months'
  GROUP BY date_trunc('month', r.created_at)::date, h.id, h.slug, h.title, rp.user_id
),
target_badges AS (
  SELECT
    mhr.month_start,
    mhr.hub_slug,
    mhr.hub_title,
    mhr.rank,
    mhr.wins,
    mhr.best_net_wpm,
    mhr.avg_accuracy
  FROM monthly_hub_ranks mhr
  JOIN target t ON t.user_id = mhr.user_id
  WHERE mhr.rank <= 10 AND mhr.wins > 0
)
SELECT
  tb.month_start,
  tb.hub_slug,
  tb.hub_title,
  tb.rank,
  tb.wins,
  tb.best_net_wpm,
  tb.avg_accuracy,
  EXISTS(SELECT 1 FROM target) AS profile_exists
FROM target_badges tb
ORDER BY tb.month_start DESC, tb.rank ASC, tb.hub_slug ASC
LIMIT 48
`, username)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_query_failed", err.Error())
		return
	}
	defer rows.Close()

	type achievementItem struct {
		ID          string  `json:"id"`
		Hub         string  `json:"hub"`
		HubTitle    string  `json:"hubTitle"`
		PeriodLabel string  `json:"periodLabel"`
		Rank        int     `json:"rank"`
		MetricType  string  `json:"metricType"`
		MetricValue float64 `json:"metricValue"`
		Wins        int     `json:"wins"`
		BadgeType   string  `json:"badgeType"`
	}

	items := make([]achievementItem, 0)
	profileExists := false

	for rows.Next() {
		var monthStart time.Time
		var hubSlug string
		var hubTitle string
		var rank int
		var wins int
		var bestNetWPM float64
		var avgAccuracy float64
		var exists bool

		if err := rows.Scan(&monthStart, &hubSlug, &hubTitle, &rank, &wins, &bestNetWPM, &avgAccuracy, &exists); err != nil {
			writeError(w, http.StatusInternalServerError, "db_scan_failed", err.Error())
			return
		}

		profileExists = exists
		badgeType := "top10"
		if rank == 1 {
			badgeType = "leader"
		} else if rank <= 3 {
			badgeType = "top3"
		}

		metricType := "wins"
		metricValue := float64(wins)
		if wins == 0 {
			metricType = "speed"
			metricValue = bestNetWPM
			if metricValue == 0 {
				metricType = "accuracy"
				metricValue = avgAccuracy
			}
		}

		periodLabel := monthStart.Format("Jan 2006")
		items = append(items, achievementItem{
			ID:          hubSlug + ":" + monthStart.Format("2006-01"),
			Hub:         hubSlug,
			HubTitle:    hubTitle,
			PeriodLabel: periodLabel,
			Rank:        rank,
			MetricType:  metricType,
			MetricValue: metricValue,
			Wins:        wins,
			BadgeType:   badgeType,
		})
	}

	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "db_rows_failed", err.Error())
		return
	}

	if !profileExists {
		var exists bool
		if err := s.db.QueryRow(r.Context(), `SELECT EXISTS(SELECT 1 FROM profiles WHERE LOWER(username) = LOWER($1))`, username).Scan(&exists); err != nil {
			writeError(w, http.StatusInternalServerError, "db_query_failed", err.Error())
			return
		}
		if !exists {
			writeError(w, http.StatusNotFound, "profile_not_found", "profile not found")
			return
		}
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"username": username,
		"items":    items,
	})
}

func profileRangeToDays(raw string) int {
	switch raw {
	case "30d":
		return 30
	case "90d":
		return 90
	case "6m":
		return 182
	case "1y", "12m", "":
		return 365
	default:
		return 365
	}
}

func rangeLabelForDays(days int) string {
	switch days {
	case 30:
		return "30d"
	case 90:
		return "90d"
	case 182:
		return "6m"
	default:
		return "1y"
	}
}

func (s *Server) handleHubs(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "only GET is supported")
		return
	}

	languageFilter := strings.TrimSpace(strings.ToLower(r.URL.Query().Get("language")))
	search := strings.TrimSpace(r.URL.Query().Get("q"))
	activeOnly := parseBoolFlag(r.URL.Query().Get("activeOnly"))
	limit := parseIntWithBounds(r.URL.Query().Get("limit"), 2000, 1, 5000)
	offset := parseIntWithBounds(r.URL.Query().Get("offset"), 0, 0, 100000)

	searchLike := ""
	if search != "" {
		searchLike = "%" + search + "%"
	}

	if err := s.ensureDefaultHubs(r.Context()); err != nil {
		writeError(w, http.StatusInternalServerError, "seed_hubs_failed", err.Error())
		return
	}

	cacheKey := fmt.Sprintf("hubs:v2:lang=%s:q=%s:active=%t:limit=%d:offset=%d", languageFilter, strings.ToLower(search), activeOnly, limit, offset)
	if s.cache != nil {
		cached, err := s.cache.Get(r.Context(), cacheKey).Bytes()
		if err == nil {
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("X-Cache", "hit")
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write(cached)
			return
		}
	}

	rows, err := s.db.Query(r.Context(), `
WITH filtered_hubs AS (
  SELECT h.id, h.slug, h.language, h.title, h.is_ranked, h.is_active
  FROM hubs h
  WHERE ($1 = '' OR h.language = $1)
    AND ($2 = '' OR h.slug ILIKE $2 OR h.language ILIKE $2 OR h.title ILIKE $2)
    AND (NOT $3 OR h.is_active = TRUE)
),
paged_hubs AS (
  SELECT
    fh.id,
    fh.slug,
    fh.language,
    fh.title,
    fh.is_ranked,
    fh.is_active,
    COUNT(*) OVER()::int AS total_count
  FROM filtered_hubs fh
  ORDER BY fh.language, fh.slug
  LIMIT $4 OFFSET $5
),
snippet_by_language AS (
  SELECT s.language, COUNT(*)::int AS snippets_total
  FROM snippets s
  WHERE s.is_active = TRUE
  GROUP BY s.language
),
snippet_all AS (
  SELECT COUNT(*)::int AS snippets_total
  FROM snippets s
  WHERE s.is_active = TRUE
),
active_stats AS (
  SELECT r.hub_id, COUNT(DISTINCT rp.user_id)::int AS active_players
  FROM races r
  JOIN race_participants rp ON rp.race_id = r.id
  JOIN paged_hubs ph ON ph.id = r.hub_id
  WHERE r.created_at > NOW() - INTERVAL '15 minutes'
  GROUP BY r.hub_id
),
today_stats AS (
  SELECT r.hub_id, COUNT(*)::int AS races_today
  FROM races r
  JOIN paged_hubs ph ON ph.id = r.hub_id
  WHERE r.created_at >= date_trunc('day', NOW())
  GROUP BY r.hub_id
),
day_wins AS (
  SELECT
    r.hub_id,
    rp.user_id,
    SUM(CASE WHEN rp.final_position = 1 THEN 1 ELSE 0 END)::int AS wins_today,
    COALESCE(MAX(rp.net_wpm), 0)::float8 AS best_net_wpm_today
  FROM race_participants rp
  JOIN races r ON r.id = rp.race_id
  JOIN paged_hubs ph ON ph.id = r.hub_id
  WHERE r.created_at >= date_trunc('day', NOW())
  GROUP BY r.hub_id, rp.user_id
),
leader_ranked AS (
  SELECT
    dw.hub_id,
    COALESCE(p.username, split_part(u.email, '@', 1)) AS leader_username,
    dw.wins_today::float8 AS leader_value,
    'wins'::text AS leader_metric,
    ROW_NUMBER() OVER (
      PARTITION BY dw.hub_id
      ORDER BY dw.wins_today DESC, dw.best_net_wpm_today DESC, COALESCE(p.username, split_part(u.email, '@', 1)) ASC
    ) AS rn
  FROM day_wins dw
  JOIN users u ON u.id = dw.user_id
  LEFT JOIN profiles p ON p.user_id = u.id
  WHERE dw.wins_today > 0
),
leader_stats AS (
  SELECT hub_id, leader_username, leader_value, leader_metric
  FROM leader_ranked
  WHERE rn = 1
)
SELECT
  h.id::text,
  h.slug,
  h.language,
  h.title,
  h.is_ranked,
  h.is_active,
  COALESCE(active_stats.active_players, 0) AS active_players,
	COALESCE(CASE WHEN h.slug = 'mixed' THEN snippet_all.snippets_total ELSE snippet_by_language.snippets_total END, 0) AS snippets_total,
  COALESCE(today_stats.races_today, 0) AS races_today,
  leader_stats.leader_username,
  leader_stats.leader_value,
  leader_stats.leader_metric,
  h.total_count
FROM paged_hubs h
LEFT JOIN active_stats ON active_stats.hub_id = h.id
LEFT JOIN snippet_by_language ON snippet_by_language.language = h.language
LEFT JOIN snippet_all ON TRUE
LEFT JOIN today_stats ON today_stats.hub_id = h.id
LEFT JOIN leader_stats ON leader_stats.hub_id = h.id
ORDER BY h.language, h.slug
`, languageFilter, searchLike, activeOnly, limit, offset)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_query_failed", err.Error())
		return
	}
	defer rows.Close()

	type hubLeader struct {
		Username string  `json:"username"`
		Value    float64 `json:"value"`
		Metric   string  `json:"metric"`
	}

	type hubItem struct {
		ID            string     `json:"id"`
		Slug          string     `json:"slug"`
		Language      string     `json:"language"`
		Title         string     `json:"title"`
		IsRanked      bool       `json:"isRanked"`
		IsActive      bool       `json:"isActive"`
		ActivePlayers int        `json:"activePlayers"`
		SnippetsTotal int        `json:"snippetsTotal"`
		RacesToday    int        `json:"racesToday"`
		LeaderToday   *hubLeader `json:"leaderToday"`
	}

	hubs := make([]hubItem, 0)
	total := 0
	for rows.Next() {
		var item hubItem
		var leaderUsername sql.NullString
		var leaderValue sql.NullFloat64
		var leaderMetric sql.NullString
		var totalCount int

		if err := rows.Scan(
			&item.ID,
			&item.Slug,
			&item.Language,
			&item.Title,
			&item.IsRanked,
			&item.IsActive,
			&item.ActivePlayers,
			&item.SnippetsTotal,
			&item.RacesToday,
			&leaderUsername,
			&leaderValue,
			&leaderMetric,
			&totalCount,
		); err != nil {
			writeError(w, http.StatusInternalServerError, "db_scan_failed", err.Error())
			return
		}

		total = totalCount

		if leaderUsername.Valid && leaderValue.Valid && leaderMetric.Valid {
			item.LeaderToday = &hubLeader{
				Username: leaderUsername.String,
				Value:    leaderValue.Float64,
				Metric:   leaderMetric.String,
			}
		}

		hubs = append(hubs, item)
	}

	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "db_rows_failed", err.Error())
		return
	}

	response := map[string]any{
		"items":      hubs,
		"total":      total,
		"limit":      limit,
		"offset":     offset,
		"hasMore":    offset+len(hubs) < total,
		"language":   languageFilter,
		"q":          search,
		"activeOnly": activeOnly,
	}

	if s.cache != nil {
		payload, err := json.Marshal(response)
		if err == nil {
			_ = s.cache.Set(r.Context(), cacheKey, payload, 15*time.Second).Err()
		}
	}

	w.Header().Set("X-Cache", "miss")
	writeJSON(w, http.StatusOK, response)
}

func (s *Server) ensureDefaultHubs(ctx context.Context) error {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	for _, language := range programmingLanguages {
		slug := normalizeHubSlug(language)
		if slug == "" {
			continue
		}

		title := buildHubTitle(language)
		if _, err := tx.Exec(ctx, `
INSERT INTO hubs (slug, language, title, is_ranked, is_active)
VALUES ($1, $2, $3, TRUE, TRUE)
ON CONFLICT (slug) DO NOTHING
`, slug, slug, title); err != nil {
			return err
		}
	}

	if _, err := tx.Exec(ctx, `
INSERT INTO hubs (slug, language, title, is_ranked, is_active)
VALUES ('mixed', 'mixed', 'Mixed Hub', FALSE, TRUE)
ON CONFLICT (slug) DO NOTHING
`); err != nil {
		return err
	}

	// Deactivate hubs that have zero active snippets (except 'mixed')
	if _, err := tx.Exec(ctx, `
UPDATE hubs
SET    is_active = FALSE
WHERE  slug <> 'mixed'
  AND  is_active = TRUE
  AND  NOT EXISTS (
       SELECT 1 FROM snippets s
       WHERE  s.language = hubs.language
         AND  s.is_active = TRUE
  )
`); err != nil {
		return err
	}

	// Re-activate hubs that have gained snippets since they were deactivated
	if _, err := tx.Exec(ctx, `
UPDATE hubs
SET    is_active = TRUE
WHERE  slug <> 'mixed'
  AND  is_active = FALSE
  AND  EXISTS (
       SELECT 1 FROM snippets s
       WHERE  s.language = hubs.language
         AND  s.is_active = TRUE
  )
`); err != nil {
		return err
	}

	if err := tx.Commit(ctx); err != nil {
		return err
	}

	return nil
}

func normalizeHubSlug(language string) string {
	slug := strings.ToLower(strings.TrimSpace(language))
	if slug == "" {
		return ""
	}

	slug = strings.ReplaceAll(slug, "+", "plus")
	slug = strings.ReplaceAll(slug, "#", "sharp")

	var b strings.Builder
	prevDash := false
	for _, r := range slug {
		isAlphaNum := (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9')
		if isAlphaNum {
			b.WriteRune(r)
			prevDash = false
			continue
		}

		if !prevDash {
			b.WriteRune('-')
			prevDash = true
		}
	}

	out := strings.Trim(b.String(), "-")
	if out == "" {
		return ""
	}

	if len(out) > 120 {
		out = out[:120]
		out = strings.TrimRight(out, "-")
	}

	return out
}

func buildHubTitle(language string) string {
	trimmed := strings.TrimSpace(language)
	if trimmed == "" {
		return "Language Hub"
	}
	return fmt.Sprintf("%s Hub", trimmed)
}

func (s *Server) handleLeaderboard(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "only GET is supported")
		return
	}

	isGlobal := r.URL.Path == "/leaderboard" || r.URL.Path == "/leaderboard/"
	hubKey := ""
	if !isGlobal {
		hubKey = strings.TrimSpace(strings.TrimPrefix(r.URL.Path, "/leaderboard/"))
		if hubKey == "" {
			writeError(w, http.StatusBadRequest, "invalid_hub", "hub id or slug is required")
			return
		}
	}

	metric := strings.TrimSpace(strings.ToLower(r.URL.Query().Get("metric")))
	if metric == "" {
		metric = "speed"
	}
	if metric != "speed" && metric != "accuracy" && metric != "wins" {
		writeError(w, http.StatusBadRequest, "invalid_metric", "metric must be one of: speed, accuracy, wins")
		return
	}

	limit := parseIntWithBounds(r.URL.Query().Get("limit"), 20, 1, 100)
	offset := parseIntWithBounds(r.URL.Query().Get("offset"), 0, 0, 100000)
	rangeParam := strings.TrimSpace(strings.ToLower(r.URL.Query().Get("range")))
	if rangeParam == "" {
		rangeParam = "weekly"
	}
	if rangeParam != "weekly" && rangeParam != "all-time" {
		writeError(w, http.StatusBadRequest, "invalid_range", "range must be one of: weekly, all-time")
		return
	}

	var hubID string
	var hubSlug string
	var hubTitle string
	if !isGlobal {
		err := s.db.QueryRow(r.Context(), `
SELECT id::text, slug, title
FROM hubs
WHERE slug = $1 OR id::text = $1
LIMIT 1
`, hubKey).Scan(&hubID, &hubSlug, &hubTitle)
		if err != nil {
			writeError(w, http.StatusNotFound, "hub_not_found", "hub not found")
			return
		}
	}

	orderBy := "best_net_wpm DESC, avg_accuracy DESC, wins DESC"
	switch metric {
	case "accuracy":
		orderBy = "avg_accuracy DESC, best_net_wpm DESC, wins DESC"
	case "wins":
		orderBy = "wins DESC, best_net_wpm DESC, avg_accuracy DESC"
	}
	orderBy += ", username ASC"

	scopeKey := "global"
	if !isGlobal {
		scopeKey = "hub:" + hubID
	}
	cacheKey := leaderboardCacheKey(scopeKey, metric, rangeParam, limit, offset)
	if s.cache != nil {
		cached, err := s.cache.Get(r.Context(), cacheKey).Bytes()
		if err == nil {
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("X-Cache", "hit")
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write(cached)
			return
		}
	}

	queryHubID := ""
	if !isGlobal {
		queryHubID = hubID
	}

	query := ""
	if rangeParam == "weekly" {
		query = `
WITH current_stats AS (
  SELECT
    u.id::text AS user_id,
    COALESCE(p.username, split_part(u.email, '@', 1)) AS username,
    COALESCE(p.avatar_url, '') AS avatar_url,
    COALESCE(p.display_name, '') AS display_name,
    COUNT(*)::int AS races_played,
    SUM(CASE WHEN rp.final_position = 1 THEN 1 ELSE 0 END)::int AS wins,
    COALESCE(MAX(rp.net_wpm), 0)::float8 AS best_net_wpm,
    COALESCE(AVG(rp.accuracy), 0)::float8 AS avg_accuracy
  FROM race_participants rp
  JOIN races r ON r.id = rp.race_id
  JOIN users u ON u.id = rp.user_id
  LEFT JOIN profiles p ON p.user_id = u.id
  WHERE ($1 = '' OR r.hub_id::text = $1)
    AND r.created_at >= NOW() - INTERVAL '7 days'
  GROUP BY u.id, p.username, u.email, p.avatar_url, p.display_name
),
current_ranked AS (
  SELECT
    cs.user_id,
    cs.username,
    cs.avatar_url,
    cs.display_name,
    cs.races_played,
    cs.wins,
    cs.best_net_wpm,
    cs.avg_accuracy,
    ROW_NUMBER() OVER (ORDER BY ` + orderBy + `)::int AS rank
  FROM current_stats cs
),
previous_stats AS (
  SELECT
    u.id::text AS user_id,
    COALESCE(p.username, split_part(u.email, '@', 1)) AS username,
    COUNT(*)::int AS races_played,
    SUM(CASE WHEN rp.final_position = 1 THEN 1 ELSE 0 END)::int AS wins,
    COALESCE(MAX(rp.net_wpm), 0)::float8 AS best_net_wpm,
    COALESCE(AVG(rp.accuracy), 0)::float8 AS avg_accuracy
  FROM race_participants rp
  JOIN races r ON r.id = rp.race_id
  JOIN users u ON u.id = rp.user_id
  LEFT JOIN profiles p ON p.user_id = u.id
  WHERE ($1 = '' OR r.hub_id::text = $1)
    AND r.created_at >= NOW() - INTERVAL '14 days'
    AND r.created_at < NOW() - INTERVAL '7 days'
  GROUP BY u.id, p.username, u.email
),
previous_ranked AS (
  SELECT
    ps.user_id,
    ROW_NUMBER() OVER (ORDER BY ` + orderBy + `)::int AS rank
  FROM previous_stats ps
)
SELECT
  cr.user_id,
  cr.username,
  cr.avatar_url,
  cr.display_name,
  cr.races_played,
  cr.wins,
  cr.best_net_wpm,
  cr.avg_accuracy,
  cr.rank,
  COALESCE(pr.rank - cr.rank, 0)::int AS rank_delta
FROM current_ranked cr
LEFT JOIN previous_ranked pr ON pr.user_id = cr.user_id
ORDER BY cr.rank
LIMIT $2 OFFSET $3
`
	} else {
		query = `
WITH stats AS (
  SELECT
    u.id::text AS user_id,
    COALESCE(p.username, split_part(u.email, '@', 1)) AS username,
    COALESCE(p.avatar_url, '') AS avatar_url,
    COALESCE(p.display_name, '') AS display_name,
    COUNT(*)::int AS races_played,
    SUM(CASE WHEN rp.final_position = 1 THEN 1 ELSE 0 END)::int AS wins,
    COALESCE(MAX(rp.net_wpm), 0)::float8 AS best_net_wpm,
    COALESCE(AVG(rp.accuracy), 0)::float8 AS avg_accuracy
  FROM race_participants rp
  JOIN races r ON r.id = rp.race_id
  JOIN users u ON u.id = rp.user_id
  LEFT JOIN profiles p ON p.user_id = u.id
  WHERE ($1 = '' OR r.hub_id::text = $1)
  GROUP BY u.id, p.username, u.email, p.avatar_url, p.display_name
),
ranked AS (
  SELECT
    s.user_id,
    s.username,
    s.avatar_url,
    s.display_name,
    s.races_played,
    s.wins,
    s.best_net_wpm,
    s.avg_accuracy,
    ROW_NUMBER() OVER (ORDER BY ` + orderBy + `)::int AS rank
  FROM stats s
)
SELECT
  r.user_id,
  r.username,
  r.avatar_url,
  r.display_name,
  r.races_played,
  r.wins,
  r.best_net_wpm,
  r.avg_accuracy,
  r.rank,
  0::int AS rank_delta
FROM ranked r
ORDER BY r.rank
LIMIT $2 OFFSET $3
`
	}

	rows, err := s.db.Query(r.Context(), query, queryHubID, limit, offset)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_query_failed", err.Error())
		return
	}
	defer rows.Close()

	type entry struct {
		UserID      string  `json:"userId"`
		Username    string  `json:"username"`
		AvatarURL   string  `json:"avatarUrl"`
		DisplayName string  `json:"displayName"`
		Rank        int     `json:"rank"`
		RankDelta   int     `json:"rankDelta"`
		MetricType  string  `json:"metricType"`
		MetricValue float64 `json:"metricValue"`
		Wins        int     `json:"wins"`
		RacesPlayed int     `json:"racesPlayed"`
		BestNetWPM  float64 `json:"bestNetWpm"`
		AvgAccuracy float64 `json:"avgAccuracy"`
	}

	items := make([]entry, 0)
	for rows.Next() {
		var e entry
		if err := rows.Scan(&e.UserID, &e.Username, &e.AvatarURL, &e.DisplayName, &e.RacesPlayed, &e.Wins, &e.BestNetWPM, &e.AvgAccuracy, &e.Rank, &e.RankDelta); err != nil {
			writeError(w, http.StatusInternalServerError, "db_scan_failed", err.Error())
			return
		}
		e.MetricType = metric
		switch metric {
		case "speed":
			e.MetricValue = e.BestNetWPM
		case "accuracy":
			e.MetricValue = e.AvgAccuracy
		case "wins":
			e.MetricValue = float64(e.Wins)
		}
		items = append(items, e)
	}

	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "db_rows_failed", err.Error())
		return
	}

	tierAverageWPM := map[string]float64{"gold": 0, "silver": 0, "bronze": 0}
	if len(items) > 0 {
		sumForRange := func(start int, end int) float64 {
			if start >= len(items) {
				return 0
			}
			if end > len(items) {
				end = len(items)
			}
			if end <= start {
				return 0
			}
			total := 0.0
			for i := start; i < end; i++ {
				total += items[i].BestNetWPM
			}
			return total / float64(end-start)
		}
		tierAverageWPM["gold"] = sumForRange(0, 10)
		tierAverageWPM["silver"] = sumForRange(10, 30)
		tierAverageWPM["bronze"] = sumForRange(30, len(items))
	}

	windowStartExpr := "to_timestamp(0)"
	if rangeParam == "weekly" {
		windowStartExpr = "NOW() - INTERVAL '7 days'"
	}

	totalRaces := 0
	if err := s.db.QueryRow(r.Context(), `
SELECT COUNT(*)::int
FROM races r
WHERE ($1 = '' OR r.hub_id::text = $1)
  AND r.created_at >= `+windowStartExpr+`
`, queryHubID).Scan(&totalRaces); err != nil {
		writeError(w, http.StatusInternalServerError, "db_query_failed", err.Error())
		return
	}

	type mostPlayedHub struct {
		Slug  string `json:"slug"`
		Title string `json:"title"`
		Races int    `json:"races"`
		Share int    `json:"sharePercent"`
	}

	mostPlayed := mostPlayedHub{}
	if err := s.db.QueryRow(r.Context(), `
SELECT h.slug, h.title, COUNT(*)::int AS races
FROM races r
JOIN hubs h ON h.id = r.hub_id
WHERE ($1 = '' OR r.hub_id::text = $1)
  AND r.created_at >= `+windowStartExpr+`
GROUP BY h.slug, h.title
ORDER BY races DESC, h.title ASC
LIMIT 1
`, queryHubID).Scan(&mostPlayed.Slug, &mostPlayed.Title, &mostPlayed.Races); err != nil {
		if err != pgx.ErrNoRows {
			writeError(w, http.StatusInternalServerError, "db_query_failed", err.Error())
			return
		}
	}
	if totalRaces > 0 && mostPlayed.Races > 0 {
		mostPlayed.Share = int(float64(mostPlayed.Races) * 100 / float64(totalRaces))
	}

	hubUsageTop10 := make([]mostPlayedHub, 0, 10)
	hubRows, err := s.db.Query(r.Context(), `
SELECT h.slug, h.title, COUNT(*)::int AS races
FROM races r
JOIN hubs h ON h.id = r.hub_id
WHERE ($1 = '' OR r.hub_id::text = $1)
  AND r.created_at >= `+windowStartExpr+`
GROUP BY h.slug, h.title
ORDER BY races DESC, h.title ASC
LIMIT 10
`, queryHubID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_query_failed", err.Error())
		return
	}
	for hubRows.Next() {
		item := mostPlayedHub{}
		if err := hubRows.Scan(&item.Slug, &item.Title, &item.Races); err != nil {
			hubRows.Close()
			writeError(w, http.StatusInternalServerError, "db_scan_failed", err.Error())
			return
		}
		if totalRaces > 0 {
			item.Share = int(float64(item.Races) * 100 / float64(totalRaces))
		}
		hubUsageTop10 = append(hubUsageTop10, item)
	}
	if err := hubRows.Err(); err != nil {
		hubRows.Close()
		writeError(w, http.StatusInternalServerError, "db_rows_failed", err.Error())
		return
	}
	hubRows.Close()

	bucketExpr := "to_char(date_trunc('day', r.created_at), 'YYYY-MM-DD')"
	if rangeParam == "all-time" {
		bucketExpr = "to_char(date_trunc('week', r.created_at), 'IYYY-\"W\"IW')"
	}

	type trendPoint struct {
		Bucket string `json:"bucket"`
		Races  int    `json:"races"`
	}
	racesTrend := make([]trendPoint, 0)
	trendRows, err := s.db.Query(r.Context(), `
SELECT `+bucketExpr+` AS bucket, COUNT(*)::int AS races
FROM races r
WHERE ($1 = '' OR r.hub_id::text = $1)
  AND r.created_at >= `+windowStartExpr+`
GROUP BY bucket
ORDER BY bucket ASC
`, queryHubID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_query_failed", err.Error())
		return
	}
	for trendRows.Next() {
		point := trendPoint{}
		if err := trendRows.Scan(&point.Bucket, &point.Races); err != nil {
			trendRows.Close()
			writeError(w, http.StatusInternalServerError, "db_scan_failed", err.Error())
			return
		}
		racesTrend = append(racesTrend, point)
	}
	if err := trendRows.Err(); err != nil {
		trendRows.Close()
		writeError(w, http.StatusInternalServerError, "db_rows_failed", err.Error())
		return
	}
	trendRows.Close()

	activeStartHour := 0
	activeWindowRaces := 0
	if err := s.db.QueryRow(r.Context(), `
SELECT ((EXTRACT(HOUR FROM r.created_at AT TIME ZONE 'UTC')::int / 4) * 4) AS start_hour, COUNT(*)::int AS races
FROM races r
WHERE ($1 = '' OR r.hub_id::text = $1)
  AND r.created_at >= `+windowStartExpr+`
GROUP BY start_hour
ORDER BY races DESC, start_hour ASC
LIMIT 1
`, queryHubID).Scan(&activeStartHour, &activeWindowRaces); err != nil {
		if err != pgx.ErrNoRows {
			writeError(w, http.StatusInternalServerError, "db_query_failed", err.Error())
			return
		}
	}

	newEntrants7d := 0
	if err := s.db.QueryRow(r.Context(), `
WITH first_seen AS (
  SELECT rp.user_id, MIN(r.created_at) AS first_at
  FROM race_participants rp
  JOIN races r ON r.id = rp.race_id
  WHERE ($1 = '' OR r.hub_id::text = $1)
  GROUP BY rp.user_id
)
SELECT COUNT(*)::int
FROM first_seen
WHERE first_at >= NOW() - INTERVAL '7 days'
`, queryHubID).Scan(&newEntrants7d); err != nil {
		writeError(w, http.StatusInternalServerError, "db_query_failed", err.Error())
		return
	}

	topImprover := map[string]any{"username": "", "delta": 0}
	bestDelta := 0
	bestUser := ""
	for _, item := range items {
		if item.RankDelta > bestDelta || (item.RankDelta == bestDelta && bestDelta > 0 && (bestUser == "" || item.Username < bestUser)) {
			bestDelta = item.RankDelta
			bestUser = item.Username
		}
	}
	if bestDelta > 0 {
		topImprover["username"] = bestUser
		topImprover["delta"] = bestDelta
	}

	activeWindowLabel := "n/a"
	if activeWindowRaces > 0 {
		activeEnd := (activeStartHour + 4) % 24
		activeWindowLabel = fmt.Sprintf("%02d:00-%02d:00 UTC", activeStartHour, activeEnd)
	}

	response := map[string]any{
		"scope":  "global",
		"metric": metric,
		"range":  rangeParam,
		"season": nil,
		"limit":  limit,
		"offset": offset,
		"items":  items,
		"community": map[string]any{
			"mostPlayedHub":    mostPlayed,
			"mostActiveWindow": map[string]any{"label": activeWindowLabel, "races": activeWindowRaces},
			"avgWpmByTier":     tierAverageWPM,
			"topImprover":      topImprover,
			"participation":    map[string]any{"rankedPlayers": len(items), "totalRaces": totalRaces, "newEntrants7d": newEntrants7d},
			"racesTrend":       racesTrend,
			"hubUsageTop10":    hubUsageTop10,
		},
	}
	if !isGlobal {
		response["scope"] = "hub"
		response["hub"] = map[string]any{
			"id":    hubID,
			"slug":  hubSlug,
			"title": hubTitle,
		}
	}

	if s.cache != nil {
		payload, err := json.Marshal(response)
		if err == nil {
			_ = s.cache.Set(r.Context(), cacheKey, payload, 30*time.Second).Err()
		}
	}

	w.Header().Set("X-Cache", "miss")
	writeJSON(w, http.StatusOK, response)
}

func (s *Server) handleSocialRivals(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "only GET is supported")
		return
	}

	metric := strings.TrimSpace(strings.ToLower(r.URL.Query().Get("metric")))
	if metric == "" {
		metric = "speed"
	}
	if metric != "speed" && metric != "accuracy" && metric != "wins" {
		writeError(w, http.StatusBadRequest, "invalid_metric", "metric must be one of: speed, accuracy, wins")
		return
	}

	rangeParam := strings.TrimSpace(strings.ToLower(r.URL.Query().Get("range")))
	if rangeParam == "" {
		rangeParam = "weekly"
	}
	if rangeParam != "weekly" && rangeParam != "all-time" {
		writeError(w, http.StatusBadRequest, "invalid_range", "range must be one of: weekly, all-time")
		return
	}

	limit := parseIntWithBounds(r.URL.Query().Get("limit"), 5, 1, 20)

	orderBy := "best_net_wpm DESC, avg_accuracy DESC, wins DESC"
	switch metric {
	case "accuracy":
		orderBy = "avg_accuracy DESC, best_net_wpm DESC, wins DESC"
	case "wins":
		orderBy = "wins DESC, best_net_wpm DESC, avg_accuracy DESC"
	}
	orderBy += ", username ASC"

	windowFilter := ""
	if rangeParam == "weekly" {
		windowFilter = "AND r.created_at >= NOW() - INTERVAL '7 days'"
	}

	query := `
WITH stats AS (
  SELECT
    u.id::text AS user_id,
    COALESCE(p.username, split_part(u.email, '@', 1)) AS username,
    COALESCE(p.avatar_url, '') AS avatar_url,
    COALESCE(p.display_name, '') AS display_name,
    COUNT(*)::int AS races_played,
    SUM(CASE WHEN rp.final_position = 1 THEN 1 ELSE 0 END)::int AS wins,
    COALESCE(MAX(rp.net_wpm), 0)::float8 AS best_net_wpm,
    COALESCE(AVG(rp.accuracy), 0)::float8 AS avg_accuracy
  FROM race_participants rp
  JOIN races r ON r.id = rp.race_id
  JOIN users u ON u.id = rp.user_id
  LEFT JOIN profiles p ON p.user_id = u.id
  WHERE TRUE ` + windowFilter + `
  GROUP BY u.id, p.username, u.email, p.avatar_url, p.display_name
),
ranked AS (
  SELECT
    s.user_id,
    s.username,
    s.avatar_url,
    s.display_name,
    s.races_played,
    s.wins,
    s.best_net_wpm,
    s.avg_accuracy,
    ROW_NUMBER() OVER (ORDER BY ` + orderBy + `)::int AS rank
  FROM stats s
)
SELECT user_id, username, avatar_url, display_name, races_played, wins, best_net_wpm, avg_accuracy, rank
FROM ranked
ORDER BY (ABS(rank - 14)), rank
LIMIT $1
`

	rows, err := s.db.Query(r.Context(), query, limit)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_query_failed", err.Error())
		return
	}
	defer rows.Close()

	type rivalItem struct {
		UserID      string  `json:"userId"`
		Username    string  `json:"username"`
		AvatarURL   string  `json:"avatarUrl"`
		DisplayName string  `json:"displayName"`
		Rank        int     `json:"rank"`
		MetricType  string  `json:"metricType"`
		MetricValue float64 `json:"metricValue"`
		Wins        int     `json:"wins"`
		RacesPlayed int     `json:"racesPlayed"`
		BestNetWPM  float64 `json:"bestNetWpm"`
		AvgAccuracy float64 `json:"avgAccuracy"`
		RankDelta   int     `json:"rankDelta"`
	}

	items := make([]rivalItem, 0)
	for rows.Next() {
		var item rivalItem
		if err := rows.Scan(&item.UserID, &item.Username, &item.AvatarURL, &item.DisplayName, &item.RacesPlayed, &item.Wins, &item.BestNetWPM, &item.AvgAccuracy, &item.Rank); err != nil {
			writeError(w, http.StatusInternalServerError, "db_scan_failed", err.Error())
			return
		}
		item.MetricType = metric
		switch metric {
		case "speed":
			item.MetricValue = item.BestNetWPM
		case "accuracy":
			item.MetricValue = item.AvgAccuracy
		case "wins":
			item.MetricValue = float64(item.Wins)
		}
		item.RankDelta = seededRankDelta(item.Username + ":" + metric + ":" + rangeParam)
		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "db_rows_failed", err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"metric": metric,
		"range":  rangeParam,
		"limit":  limit,
		"items":  items,
	})
}

func (s *Server) handleProfileRaces(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "only GET is supported")
		return
	}

	email := strings.TrimSpace(r.Header.Get("X-User-Email"))
	if email == "" {
		email = strings.TrimSpace(r.URL.Query().Get("email"))
	}
	if email == "" {
		writeError(w, http.StatusBadRequest, "missing_identity", "provide X-User-Email header or email query param")
		return
	}

	limit := parseIntWithBounds(r.URL.Query().Get("limit"), 20, 1, 100)
	offset := parseIntWithBounds(r.URL.Query().Get("offset"), 0, 0, 100000)

	rows, err := s.db.Query(r.Context(), `
SELECT
  r.external_race_id,
  r.external_room_id,
  COALESCE(h.slug, ''),
  COALESCE(r.finish_reason, ''),
  r.started_at,
  r.ended_at,
  rp.final_position,
  rp.completion_percent,
  rp.net_wpm,
  rp.accuracy,
  rp.errors_count
FROM race_participants rp
JOIN races r ON r.id = rp.race_id
JOIN users u ON u.id = rp.user_id
LEFT JOIN hubs h ON h.id = r.hub_id
WHERE u.email = $1
ORDER BY r.created_at DESC
LIMIT $2 OFFSET $3
`, email, limit, offset)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_query_failed", err.Error())
		return
	}
	defer rows.Close()

	type raceItem struct {
		RaceID            string     `json:"raceId"`
		RoomID            string     `json:"roomId"`
		Hub               string     `json:"hub"`
		FinishReason      string     `json:"finishReason"`
		StartedAt         *time.Time `json:"startedAt,omitempty"`
		EndedAt           *time.Time `json:"endedAt,omitempty"`
		FinalPosition     int        `json:"finalPosition"`
		CompletionPercent float64    `json:"completionPercent"`
		NetWPM            float64    `json:"netWpm"`
		Accuracy          float64    `json:"accuracy"`
		ErrorsCount       int        `json:"errorsCount"`
	}

	items := make([]raceItem, 0)
	for rows.Next() {
		var item raceItem
		if err := rows.Scan(
			&item.RaceID,
			&item.RoomID,
			&item.Hub,
			&item.FinishReason,
			&item.StartedAt,
			&item.EndedAt,
			&item.FinalPosition,
			&item.CompletionPercent,
			&item.NetWPM,
			&item.Accuracy,
			&item.ErrorsCount,
		); err != nil {
			writeError(w, http.StatusInternalServerError, "db_scan_failed", err.Error())
			return
		}
		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "db_rows_failed", err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"email":  email,
		"limit":  limit,
		"offset": offset,
		"items":  items,
	})
}

// handleMyRaces returns the authenticated user's race history.
// GET /api/me/races?limit=20&offset=0&hub=go
func (s *Server) handleMyRaces(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "only GET is supported")
		return
	}

	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized", "authentication required")
		return
	}

	limit := parseIntWithBounds(r.URL.Query().Get("limit"), 20, 1, 100)
	offset := parseIntWithBounds(r.URL.Query().Get("offset"), 0, 0, 100000)
	hubFilter := strings.TrimSpace(strings.ToLower(r.URL.Query().Get("hub")))

	rows, err := s.db.Query(r.Context(), `
SELECT
  r.external_race_id,
  r.external_room_id,
  COALESCE(h.slug, ''),
  COALESCE(h.title, ''),
  COALESCE(r.finish_reason, ''),
  r.started_at,
  r.ended_at,
  rp.final_position,
  rp.completion_percent,
  rp.net_wpm,
  rp.accuracy,
  rp.errors_count,
  r.created_at
FROM race_participants rp
JOIN races r ON r.id = rp.race_id
LEFT JOIN hubs h ON h.id = r.hub_id
WHERE rp.user_id = $1
  AND ($4 = '' OR h.slug = $4)
ORDER BY r.created_at DESC
LIMIT $2 OFFSET $3
`, userID, limit, offset, hubFilter)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_query_failed", err.Error())
		return
	}
	defer rows.Close()

	type raceItem struct {
		RaceID            string     `json:"raceId"`
		RoomID            string     `json:"roomId"`
		Hub               string     `json:"hub"`
		HubTitle          string     `json:"hubTitle"`
		FinishReason      string     `json:"finishReason"`
		StartedAt         *time.Time `json:"startedAt,omitempty"`
		EndedAt           *time.Time `json:"endedAt,omitempty"`
		FinalPosition     int        `json:"finalPosition"`
		CompletionPercent float64    `json:"completionPercent"`
		NetWPM            float64    `json:"netWpm"`
		Accuracy          float64    `json:"accuracy"`
		ErrorsCount       int        `json:"errorsCount"`
		CreatedAt         time.Time  `json:"createdAt"`
	}

	items := make([]raceItem, 0)
	for rows.Next() {
		var item raceItem
		if err := rows.Scan(
			&item.RaceID,
			&item.RoomID,
			&item.Hub,
			&item.HubTitle,
			&item.FinishReason,
			&item.StartedAt,
			&item.EndedAt,
			&item.FinalPosition,
			&item.CompletionPercent,
			&item.NetWPM,
			&item.Accuracy,
			&item.ErrorsCount,
			&item.CreatedAt,
		); err != nil {
			writeError(w, http.StatusInternalServerError, "db_scan_failed", err.Error())
			return
		}
		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "db_rows_failed", err.Error())
		return
	}

	// Get total count for pagination.
	var total int
	_ = s.db.QueryRow(r.Context(), `
SELECT COUNT(*)::int
FROM race_participants rp
JOIN races r ON r.id = rp.race_id
LEFT JOIN hubs h ON h.id = r.hub_id
WHERE rp.user_id = $1
  AND ($2 = '' OR h.slug = $2)
`, userID, hubFilter).Scan(&total)

	writeJSON(w, http.StatusOK, map[string]any{
		"items":   items,
		"total":   total,
		"limit":   limit,
		"offset":  offset,
		"hasMore": offset+len(items) < total,
	})
}

// handleMyHubStats returns per-hub aggregated stats for the authenticated user.
// GET /api/me/hub-stats
func (s *Server) handleMyHubStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "only GET is supported")
		return
	}

	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized", "authentication required")
		return
	}

	rows, err := s.db.Query(r.Context(), `
SELECT
  h.slug,
  h.title,
  COUNT(*)::int AS races_played,
  SUM(CASE WHEN rp.final_position = 1 THEN 1 ELSE 0 END)::int AS wins,
  COALESCE(ROUND(AVG(rp.net_wpm)::numeric, 1), 0)::float8 AS avg_wpm,
  COALESCE(MAX(rp.net_wpm), 0)::float8 AS best_wpm,
  COALESCE(ROUND(AVG(rp.accuracy)::numeric, 1), 0)::float8 AS avg_accuracy
FROM race_participants rp
JOIN races r ON r.id = rp.race_id
JOIN hubs h ON h.id = r.hub_id
WHERE rp.user_id = $1
GROUP BY h.id, h.slug, h.title
ORDER BY races_played DESC
`, userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_query_failed", err.Error())
		return
	}
	defer rows.Close()

	type hubStat struct {
		Slug        string  `json:"slug"`
		Title       string  `json:"title"`
		RacesPlayed int     `json:"racesPlayed"`
		Wins        int     `json:"wins"`
		AvgWpm      float64 `json:"avgWpm"`
		BestWpm     float64 `json:"bestWpm"`
		AvgAccuracy float64 `json:"avgAccuracy"`
	}

	items := make([]hubStat, 0)
	for rows.Next() {
		var item hubStat
		if err := rows.Scan(
			&item.Slug, &item.Title,
			&item.RacesPlayed, &item.Wins,
			&item.AvgWpm, &item.BestWpm, &item.AvgAccuracy,
		); err != nil {
			writeError(w, http.StatusInternalServerError, "db_scan_failed", err.Error())
			return
		}
		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "db_rows_failed", err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"items": items,
	})
}

// handleMyAccount handles GET (account info) and DELETE (account deletion).
// GET /api/me/account
// DELETE /api/me/account
func (s *Server) handleMyAccount(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		s.handleMyAccountGet(w, r)
	case http.MethodDelete:
		s.handleMyAccountDelete(w, r)
	default:
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "only GET and DELETE are supported")
	}
}

func (s *Server) handleMyAccountGet(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized", "authentication required")
		return
	}

	var (
		email        string
		authProvider string
		username     string
		githubID     sql.NullInt64
		createdAt    time.Time
	)

	err := s.db.QueryRow(r.Context(), `
SELECT u.email, u.auth_provider, p.username, u.github_id, u.created_at
FROM users u
JOIN profiles p ON p.user_id = u.id
WHERE u.id = $1
`, userID).Scan(&email, &authProvider, &username, &githubID, &createdAt)
	if err != nil {
		writeError(w, http.StatusNotFound, "user_not_found", "user not found")
		return
	}

	result := map[string]any{
		"email":        email,
		"authProvider": authProvider,
		"username":     username,
		"createdAt":    createdAt,
	}
	if githubID.Valid {
		result["githubId"] = githubID.Int64
	}

	writeJSON(w, http.StatusOK, result)
}

func (s *Server) handleMyAccountDelete(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized", "authentication required")
		return
	}

	// Require confirmation in the request body.
	var body struct {
		Confirm string `json:"confirm"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Confirm != "DELETE" {
		writeError(w, http.StatusBadRequest, "confirmation_required", "request body must include {\"confirm\": \"DELETE\"}")
		return
	}

	// Transactional cascade deletion.
	tx, err := s.db.Begin(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "failed to begin transaction")
		return
	}
	defer func() { _ = tx.Rollback(r.Context()) }()

	// Delete leaderboard entries.
	if _, err := tx.Exec(r.Context(), `DELETE FROM leaderboard_entries WHERE user_id = $1`, userID); err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "failed to delete leaderboard entries")
		return
	}

	// Delete race participants.
	if _, err := tx.Exec(r.Context(), `DELETE FROM race_participants WHERE user_id = $1`, userID); err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "failed to delete race participation data")
		return
	}

	// Delete profile (CASCADE from users would handle this, but be explicit).
	if _, err := tx.Exec(r.Context(), `DELETE FROM profiles WHERE user_id = $1`, userID); err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "failed to delete profile")
		return
	}

	// Delete user.
	if _, err := tx.Exec(r.Context(), `DELETE FROM users WHERE id = $1`, userID); err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "failed to delete user")
		return
	}

	if err := tx.Commit(r.Context()); err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "failed to commit deletion")
		return
	}

	// Invalidate cached leaderboard data.
	if s.cache != nil {
		iter := s.cache.Scan(r.Context(), 0, "leaderboard:*", 100).Iterator()
		for iter.Next(r.Context()) {
			s.cache.Del(r.Context(), iter.Val())
		}
	}

	// Clear session cookie.
	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    "",
		Path:     "/",
		Domain:   s.cfg.CookieDomain,
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   s.cfg.AppEnv != "development",
		SameSite: http.SameSiteLaxMode,
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"message": "account deleted successfully",
	})
}

func parseIntWithBounds(raw string, fallback int, min int, max int) int {
	if strings.TrimSpace(raw) == "" {
		return fallback
	}
	v, err := strconv.Atoi(raw)
	if err != nil {
		return fallback
	}
	if v < min {
		return min
	}
	if v > max {
		return max
	}
	return v
}

func parseBoolFlag(raw string) bool {
	v := strings.TrimSpace(strings.ToLower(raw))
	return v == "1" || v == "true" || v == "yes" || v == "on"
}

func seededRankDelta(seed string) int {
	hash := 0
	for _, r := range seed {
		hash = (hash*37 + int(r)) & 0x7fffffff
	}
	return (hash % 7) - 3
}

func leaderboardCacheKey(scopeKey string, metric string, rangeParam string, limit int, offset int) string {
	return "leaderboard:v2:scope:" + scopeKey + ":metric:" + metric + ":range:" + rangeParam + ":limit:" + strconv.Itoa(limit) + ":offset:" + strconv.Itoa(offset)
}

// handleRaceDetail returns the full details of a finished race by its external race ID.
// GET /races/{externalRaceId}
func (s *Server) handleRaceDetail(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "only GET is supported")
		return
	}

	externalRaceID := strings.TrimSpace(strings.TrimPrefix(r.URL.Path, "/races/"))
	externalRaceID = strings.Trim(externalRaceID, "/")
	if externalRaceID == "" {
		writeError(w, http.StatusBadRequest, "missing_race_id", "race id is required")
		return
	}

	type participantRow struct {
		ClientID          string  `json:"clientId"`
		DisplayName       string  `json:"displayName,omitempty"`
		AvatarURL         string  `json:"avatarUrl,omitempty"`
		Position          int     `json:"position"`
		CompletionPercent float64 `json:"completionPercent"`
		GrossWPM          float64 `json:"grossWpm"`
		NetWPM            float64 `json:"netWpm"`
		Accuracy          float64 `json:"accuracy"`
		Errors            int     `json:"errors"`
		Finished          bool    `json:"finished"`
		FinishedElapsedMs *int64  `json:"finishedElapsedMs"`
	}

	var (
		raceID       string
		hubSlug      string
		hubTitle     string
		snippetCode  string
		snippetLang  string
		snippetDiff  int
		status       string
		finishReason sql.NullString
		startedAt    sql.NullTime
		endedAt      sql.NullTime
		createdAt    time.Time
	)

	err := s.db.QueryRow(r.Context(), `
SELECT
    r.id::text,
    h.slug,
    h.title,
    s.code,
    s.language,
    s.difficulty,
    r.status,
    r.finish_reason,
    r.started_at,
    r.ended_at,
    r.created_at
FROM races r
JOIN hubs h ON h.id = r.hub_id
JOIN snippets s ON s.id = r.snippet_id
WHERE r.external_race_id = $1
`, externalRaceID).Scan(
		&raceID, &hubSlug, &hubTitle,
		&snippetCode, &snippetLang, &snippetDiff,
		&status, &finishReason,
		&startedAt, &endedAt, &createdAt,
	)
	if err != nil {
		writeError(w, http.StatusNotFound, "race_not_found", "race not found")
		return
	}

	rows, err := s.db.Query(r.Context(), `
SELECT
    COALESCE(p.username, u.email) AS client_id,
    COALESCE(p.username, '') AS display_name,
    COALESCE(p.avatar_url, '') AS avatar_url,
    rp.final_position,
    rp.completion_percent,
    rp.gross_wpm,
    rp.net_wpm,
    rp.accuracy,
    rp.errors_count,
    rp.finished_at IS NOT NULL AS finished,
    CASE
        WHEN rp.finished_at IS NOT NULL AND $2::timestamptz IS NOT NULL
        THEN EXTRACT(EPOCH FROM (rp.finished_at - $2::timestamptz)) * 1000
        ELSE NULL
    END AS finished_elapsed_ms
FROM race_participants rp
JOIN users u ON u.id = rp.user_id
LEFT JOIN profiles p ON p.user_id = u.id
WHERE rp.race_id = $1
ORDER BY rp.final_position ASC
`, raceID, startedAt)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "query_error", "failed to load participants")
		return
	}
	defer rows.Close()

	var participants []participantRow
	for rows.Next() {
		var p participantRow
		var elapsedMs sql.NullFloat64
		if err := rows.Scan(
			&p.ClientID, &p.DisplayName, &p.AvatarURL,
			&p.Position, &p.CompletionPercent,
			&p.GrossWPM, &p.NetWPM, &p.Accuracy, &p.Errors,
			&p.Finished, &elapsedMs,
		); err != nil {
			continue
		}
		if elapsedMs.Valid {
			v := int64(elapsedMs.Float64)
			p.FinishedElapsedMs = &v
		}
		participants = append(participants, p)
	}

	resp := map[string]any{
		"raceId":       externalRaceID,
		"hubSlug":      hubSlug,
		"hubTitle":     hubTitle,
		"snippet":      snippetCode,
		"snippetLang":  snippetLang,
		"snippetLen":   len(snippetCode),
		"difficulty":   snippetDiff,
		"status":       status,
		"createdAt":    createdAt,
		"participants": participants,
	}
	if finishReason.Valid {
		resp["finishReason"] = finishReason.String
	}
	if startedAt.Valid {
		resp["startedAt"] = startedAt.Time
	}
	if endedAt.Valid {
		resp["endedAt"] = endedAt.Time
	}
	if startedAt.Valid && endedAt.Valid {
		resp["durationMs"] = endedAt.Time.Sub(startedAt.Time).Milliseconds()
	}

	writeJSON(w, http.StatusOK, resp)
}

// handleSnippetRandom returns a random active snippet, optionally filtered by language.
// GET /snippets/random?language=go
func (s *Server) handleSnippetRandom(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "only GET is supported")
		return
	}

	language := strings.TrimSpace(strings.ToLower(r.URL.Query().Get("language")))

	var (
		id         string
		lang       string
		title      string
		difficulty int
		code       string
	)

	err := s.db.QueryRow(r.Context(), `
SELECT id::text, language, title, difficulty, code
FROM snippets
WHERE is_active = TRUE
  AND ($1 = '' OR language = $1)
ORDER BY random()
LIMIT 1
`, language).Scan(&id, &lang, &title, &difficulty, &code)
	if err != nil {
		if err == pgx.ErrNoRows {
			writeError(w, http.StatusNotFound, "no_snippets", "no active snippets found")
			return
		}
		writeError(w, http.StatusInternalServerError, "db_query_failed", err.Error())
		return
	}

	// Normalise escape sequences that were stored as literal characters
	// (e.g. a two-char `\n` instead of a real newline). This happens when
	// SQL INSERTs use standard string literals instead of E-strings.
	code = strings.ReplaceAll(code, `\n`, "\n")
	code = strings.ReplaceAll(code, `\t`, "\t")

	writeJSON(w, http.StatusOK, map[string]any{
		"id":         id,
		"language":   lang,
		"title":      title,
		"difficulty": difficulty,
		"code":       code,
	})
}

func (s *Server) handlePlatformStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "only GET is supported")
		return
	}

	flusher, ok := w.(http.Flusher)
	if !ok {
		writeError(w, http.StatusInternalServerError, "sse_unsupported", "streaming not supported")
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.WriteHeader(http.StatusOK)
	flusher.Flush()

	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	sendStats := func() {
		var totalRaces, activeHubs, races24h, onlinePlayers int

		ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
		defer cancel()

		_ = s.db.QueryRow(ctx, `SELECT COUNT(*)::int FROM races`).Scan(&totalRaces)
		_ = s.db.QueryRow(ctx, `
			SELECT COUNT(DISTINCT r.hub_id)::int
			FROM races r
			WHERE r.created_at > NOW() - INTERVAL '24 hours'
		`).Scan(&activeHubs)
		_ = s.db.QueryRow(ctx, `
			SELECT COUNT(*)::int FROM races
			WHERE created_at > NOW() - INTERVAL '24 hours'
		`).Scan(&races24h)

		if s.cache != nil {
			val, err := s.cache.Get(ctx, "platform:online_players").Int()
			if err == nil {
				onlinePlayers = val
			}
		}

		payload := map[string]int{
			"totalRaces":    totalRaces,
			"activeHubs":    activeHubs,
			"races24h":      races24h,
			"onlinePlayers": onlinePlayers,
		}

		data, _ := json.Marshal(payload)
		_, _ = fmt.Fprintf(w, "data: %s\n\n", data)
		flusher.Flush()
	}

	// Send initial data immediately.
	sendStats()

	for {
		select {
		case <-r.Context().Done():
			return
		case <-ticker.C:
			sendStats()
		}
	}
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, code string, message string) {
	writeJSON(w, status, map[string]any{
		"error": map[string]any{
			"code":    code,
			"message": message,
		},
	})
}
