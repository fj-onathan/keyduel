package bot

import (
	"testing"
)

func TestAssignTierIsDeterministic(t *testing.T) {
	// The same username must always produce the same tier.
	usernames := []string{"gopher_1", "pycraft_guru", "ts_wizard", "speed_demon", "cargo_master"}
	for _, u := range usernames {
		tier1 := assignTier(u)
		tier2 := assignTier(u)
		if tier1 != tier2 {
			t.Errorf("assignTier(%q) returned %q then %q — not deterministic", u, tier1, tier2)
		}
	}
}

func TestAssignTierReturnsValidTier(t *testing.T) {
	valid := map[Tier]bool{
		TierBeginner:     true,
		TierIntermediate: true,
		TierAdvanced:     true,
		TierElite:        true,
	}

	// Check a broad range of usernames.
	for i := 0; i < 200; i++ {
		username := "bot_user_" + string(rune('a'+i%26)) + string(rune('a'+i/26))
		tier := assignTier(username)
		if !valid[tier] {
			t.Errorf("assignTier(%q) returned invalid tier %q", username, tier)
		}
	}
}

func TestHashUsernameIsDeterministic(t *testing.T) {
	h1 := hashUsername("test_user")
	h2 := hashUsername("test_user")
	if h1 != h2 {
		t.Fatalf("hashUsername not deterministic: %d != %d", h1, h2)
	}
}

func TestHashUsernameProducesDifferentValues(t *testing.T) {
	h1 := hashUsername("user_a")
	h2 := hashUsername("user_b")
	if h1 == h2 {
		t.Fatalf("hashUsername produced same value for different inputs")
	}
}

func TestTierSpecsWPMRangesAreValid(t *testing.T) {
	for tier, spec := range tierSpecs {
		if spec.MinWPM >= spec.MaxWPM {
			t.Errorf("tier %s: MinWPM (%f) >= MaxWPM (%f)", tier, spec.MinWPM, spec.MaxWPM)
		}
		if spec.MinAccuracy >= spec.MaxAccuracy {
			t.Errorf("tier %s: MinAccuracy (%f) >= MaxAccuracy (%f)", tier, spec.MinAccuracy, spec.MaxAccuracy)
		}
		if spec.MinWPM < 0 {
			t.Errorf("tier %s: MinWPM is negative", tier)
		}
		if spec.MinAccuracy < 0 || spec.MaxAccuracy > 100 {
			t.Errorf("tier %s: accuracy out of valid range [0, 100]", tier)
		}
	}
}

func TestTierSpecsHaveNonOverlappingWPMRanges(t *testing.T) {
	// Verify tiers form a progression from slow to fast.
	order := []Tier{TierBeginner, TierIntermediate, TierAdvanced, TierElite}
	for i := 1; i < len(order); i++ {
		prev := tierSpecs[order[i-1]]
		curr := tierSpecs[order[i]]
		if curr.MinWPM < prev.MinWPM {
			t.Errorf("tier %s MinWPM (%f) < tier %s MinWPM (%f) — progression broken",
				order[i], curr.MinWPM, order[i-1], prev.MinWPM)
		}
	}
}

func TestDerivedWPMFallsWithinTierRange(t *testing.T) {
	// Simulate what LoadIdentities does: hash-based WPM within tier bounds.
	usernames := []string{
		"alpha_bot", "beta_bot", "gamma_bot", "delta_bot", "epsilon_bot",
		"zeta_bot", "eta_bot", "theta_bot", "iota_bot", "kappa_bot",
	}
	for _, u := range usernames {
		tier := assignTier(u)
		spec := tierSpecs[tier]
		h := hashUsername(u)
		fraction := float64(h%1000) / 1000.0
		wpm := spec.MinWPM + fraction*(spec.MaxWPM-spec.MinWPM)
		acc := spec.MinAccuracy + fraction*(spec.MaxAccuracy-spec.MinAccuracy)

		if wpm < spec.MinWPM || wpm > spec.MaxWPM {
			t.Errorf("user %q (tier %s): WPM %f outside [%f, %f]", u, tier, wpm, spec.MinWPM, spec.MaxWPM)
		}
		if acc < spec.MinAccuracy || acc > spec.MaxAccuracy {
			t.Errorf("user %q (tier %s): accuracy %f outside [%f, %f]", u, tier, acc, spec.MinAccuracy, spec.MaxAccuracy)
		}
	}
}

func TestResolvePreferredHubs(t *testing.T) {
	tests := []struct {
		username string
		expected []string
	}{
		{"gopher_1", []string{"go"}},
		{"go_ninja", []string{"go"}},
		{"cargo_runner", []string{"rust"}},
		{"rustacean_42", []string{"rust"}},
		{"pycraft_guru", []string{"python"}},
		{"py_master", []string{"python"}},
		{"ts_wizard", []string{"typescript"}},
		{"npm_ninja", []string{"javascript"}},
		{"js_hero", []string{"javascript"}},
		{"swift_coder", []string{"swift"}},
		{"kotlin_pro", []string{"kotlin"}},
		{"java_dev", []string{"java"}},
		{"ruby_gem", []string{"ruby"}},
		{"lua_script", []string{"lua"}},
		{"wasm_builder", []string{"go", "rust"}},
	}

	for _, tc := range tests {
		hubs := resolvePreferredHubs(tc.username)
		if !slicesEqual(hubs, tc.expected) {
			t.Errorf("resolvePreferredHubs(%q) = %v, want %v", tc.username, hubs, tc.expected)
		}
	}
}

func TestResolvePreferredHubsFallsBackToAllHubs(t *testing.T) {
	hubs := resolvePreferredHubs("random_user_xyz")
	if len(hubs) != len(allHubs) {
		t.Errorf("expected fallback to allHubs (%d hubs), got %d", len(allHubs), len(hubs))
	}
}

func TestContainsSubstring(t *testing.T) {
	tests := []struct {
		s, sub string
		want   bool
	}{
		{"gopher_1", "gopher", true},
		{"the_gopher", "gopher", true},
		{"go_ninja", "go_", true},
		{"random_user", "gopher", false},
		{"", "any", false},
		{"abc", "", true},
	}

	for _, tc := range tests {
		got := containsSubstring(tc.s, tc.sub)
		if got != tc.want {
			t.Errorf("containsSubstring(%q, %q) = %v, want %v", tc.s, tc.sub, got, tc.want)
		}
	}
}

func TestAllHubsIsNotEmpty(t *testing.T) {
	if len(allHubs) == 0 {
		t.Fatal("allHubs should not be empty")
	}
}

func TestAllHubsContainsExpectedLanguages(t *testing.T) {
	expected := []string{"python", "javascript", "typescript", "go", "rust"}
	for _, lang := range expected {
		found := false
		for _, hub := range allHubs {
			if hub == lang {
				found = true
				break
			}
		}
		if !found {
			t.Errorf("allHubs missing expected language %q", lang)
		}
	}
}

// slicesEqual checks if two string slices have the same elements.
func slicesEqual(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}
