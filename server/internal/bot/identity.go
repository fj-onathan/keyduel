package bot

import (
	"context"
	"crypto/sha256"
	"encoding/binary"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Tier represents a bot's skill level.
type Tier string

const (
	TierBeginner     Tier = "beginner"
	TierIntermediate Tier = "intermediate"
	TierAdvanced     Tier = "advanced"
	TierElite        Tier = "elite"
)

// BotIdentity holds the database-loaded identity and derived performance stats.
type BotIdentity struct {
	UserID       string
	Email        string
	Username     string
	DisplayName  string
	AvatarURL    string
	Tier         Tier
	BaseWPM      float64
	BaseAccuracy float64
	// PreferredHubs is derived from the username theme.
	PreferredHubs []string
}

// tierSpec defines the WPM and accuracy ranges for a tier.
type tierSpec struct {
	MinWPM      float64
	MaxWPM      float64
	MinAccuracy float64
	MaxAccuracy float64
}

var tierSpecs = map[Tier]tierSpec{
	TierBeginner:     {30, 60, 93.0, 96.0},
	TierIntermediate: {60, 100, 95.5, 98.0},
	TierAdvanced:     {100, 140, 97.7, 99.0},
	TierElite:        {140, 170, 98.8, 99.5},
}

// hubPreferences maps username patterns to preferred programming language hubs.
var hubPreferences = map[string][]string{
	"gopher":    {"go"},
	"go_":       {"go"},
	"cargo":     {"rust"},
	"rustacean": {"rust"},
	"pycraft":   {"python"},
	"py":        {"python"},
	"ts_":       {"typescript"},
	"npm":       {"javascript"},
	"js":        {"javascript"},
	"swift":     {"swift"},
	"kotlin":    {"kotlin"},
	"java":      {"java"},
	"ruby":      {"ruby"},
	"lua":       {"lua"},
	"wasm":      {"go", "rust"},
}

// allHubs is the default hub pool when no preference matches.
var allHubs = []string{
	"python", "javascript", "typescript", "go", "rust",
	"java", "c", "kotlin", "swift", "ruby",
}

// LoadIdentities reads all bot users from the database and assigns tiers based
// on a deterministic hash of their username.
func LoadIdentities(ctx context.Context, db *pgxpool.Pool) ([]BotIdentity, error) {
	rows, err := db.Query(ctx, `
		SELECT u.id::text, u.email,
		       p.username,
		       COALESCE(NULLIF(p.display_name, ''), p.username),
		       COALESCE(p.avatar_url, '')
		FROM users u
		JOIN profiles p ON p.user_id = u.id
		WHERE u.email LIKE '%@bot.race.local'
		ORDER BY p.username
	`)
	if err != nil {
		return nil, fmt.Errorf("query bot identities: %w", err)
	}
	defer rows.Close()

	var identities []BotIdentity
	for rows.Next() {
		var id BotIdentity
		if err := rows.Scan(&id.UserID, &id.Email, &id.Username, &id.DisplayName, &id.AvatarURL); err != nil {
			return nil, fmt.Errorf("scan bot identity: %w", err)
		}

		id.Tier = assignTier(id.Username)
		spec := tierSpecs[id.Tier]

		// Deterministic WPM within tier range based on username hash.
		h := hashUsername(id.Username)
		fraction := float64(h%1000) / 1000.0
		id.BaseWPM = spec.MinWPM + fraction*(spec.MaxWPM-spec.MinWPM)
		id.BaseAccuracy = spec.MinAccuracy + fraction*(spec.MaxAccuracy-spec.MinAccuracy)

		id.PreferredHubs = resolvePreferredHubs(id.Username)

		identities = append(identities, id)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate bot identities: %w", err)
	}

	log.Printf("[bot] loaded %d identities", len(identities))
	return identities, nil
}

// assignTier maps a username to a tier using a deterministic hash.
// The distribution matches the seed data: ~20% beginner, ~40% intermediate,
// ~27% advanced, ~13% elite.
func assignTier(username string) Tier {
	h := hashUsername(username)
	bucket := h % 100
	switch {
	case bucket < 20:
		return TierBeginner
	case bucket < 60:
		return TierIntermediate
	case bucket < 87:
		return TierAdvanced
	default:
		return TierElite
	}
}

// hashUsername returns a deterministic uint64 from a username string.
func hashUsername(username string) uint64 {
	sum := sha256.Sum256([]byte(username))
	return binary.BigEndian.Uint64(sum[:8])
}

// resolvePreferredHubs finds hub preferences based on username substrings.
// When multiple patterns match, the longest match wins for determinism.
func resolvePreferredHubs(username string) []string {
	var bestKey string
	var bestHubs []string
	for prefix, hubs := range hubPreferences {
		if containsSubstring(username, prefix) && len(prefix) > len(bestKey) {
			bestKey = prefix
			bestHubs = hubs
		}
	}
	if bestHubs != nil {
		return bestHubs
	}
	return allHubs
}

func containsSubstring(s, sub string) bool {
	return len(s) >= len(sub) && searchSubstring(s, sub)
}

func searchSubstring(s, sub string) bool {
	for i := 0; i <= len(s)-len(sub); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}
