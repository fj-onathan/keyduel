package race

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// SnippetProvider implements ws.SnippetProvider by querying the snippets table.
type SnippetProvider struct {
	db *pgxpool.Pool
}

func NewSnippetProvider(db *pgxpool.Pool) *SnippetProvider {
	return &SnippetProvider{db: db}
}

// RandomSnippet selects a random active snippet for the given language.
// It returns an error only if the database query fails; if no snippets exist
// for the language it returns ("", nil) so the caller can fall back to a default.
func (sp *SnippetProvider) RandomSnippet(ctx context.Context, language string) (string, error) {
	if sp == nil || sp.db == nil {
		return "", nil
	}

	lang := strings.TrimSpace(strings.ToLower(language))
	if lang == "" {
		lang = "go"
	}

	var code string
	err := sp.db.QueryRow(ctx, `
SELECT code
FROM snippets
WHERE language = $1
  AND is_active = TRUE
ORDER BY random()
LIMIT 1
`, lang).Scan(&code)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			// No snippets for this language — caller should use fallback
			return "", nil
		}
		return "", fmt.Errorf("query random snippet for %q: %w", lang, err)
	}

	return code, nil
}
