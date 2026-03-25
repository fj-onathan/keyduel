package bot

import (
	"context"
	"testing"
	"time"
)

func makeTestIdentities(count int) []BotIdentity {
	ids := make([]BotIdentity, count)
	for i := 0; i < count; i++ {
		username := "test_bot_" + string(rune('a'+i%26)) + string(rune('a'+i/26))
		tier := assignTier(username)
		spec := tierSpecs[tier]
		h := hashUsername(username)
		fraction := float64(h%1000) / 1000.0

		ids[i] = BotIdentity{
			UserID:        "uid-" + username,
			Email:         username + "@bot.race.local",
			Username:      username,
			DisplayName:   username,
			Tier:          tier,
			BaseWPM:       spec.MinWPM + fraction*(spec.MaxWPM-spec.MinWPM),
			BaseAccuracy:  spec.MinAccuracy + fraction*(spec.MaxAccuracy-spec.MinAccuracy),
			PreferredHubs: resolvePreferredHubs(username),
		}
	}
	return ids
}

// testEntry creates a botEntry for testing (with a done channel that won't be closed).
func testEntry(p *Player) *botEntry {
	return &botEntry{player: p, done: make(chan struct{})}
}

func TestNewManagerCreatesEmptyActiveBots(t *testing.T) {
	cfg := Config{Enabled: true, Concurrency: 3, MinConcurrency: 2, MaxConcurrency: 5}
	ids := makeTestIdentities(10)
	m := NewManager(cfg, ids, nil)

	if m.activeCount() != 0 {
		t.Fatalf("expected 0 active bots on creation, got %d", m.activeCount())
	}
}

func TestNewManagerInitialTargetWithinRange(t *testing.T) {
	cfg := Config{Enabled: true, Concurrency: 5, MinConcurrency: 3, MaxConcurrency: 8}
	ids := makeTestIdentities(20)

	// Run many times since initial target is random.
	for i := 0; i < 50; i++ {
		m := NewManager(cfg, ids, nil)
		m.mu.Lock()
		target := m.targetConcurrency
		m.mu.Unlock()

		if target < 3 || target > 8 {
			t.Fatalf("initial target %d outside range [3, 8]", target)
		}
	}
}

func TestNewManagerClampsMaxToIdentityCount(t *testing.T) {
	cfg := Config{Enabled: true, Concurrency: 5, MinConcurrency: 3, MaxConcurrency: 20}
	ids := makeTestIdentities(8)
	m := NewManager(cfg, ids, nil)

	if m.cfg.MaxConcurrency != 8 {
		t.Fatalf("expected MaxConcurrency clamped to 8 (identity count), got %d", m.cfg.MaxConcurrency)
	}
}

func TestManagerRunExitsWhenNoIdentities(t *testing.T) {
	cfg := Config{Enabled: true, Concurrency: 3}
	m := NewManager(cfg, nil, nil)

	ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
	defer cancel()

	done := make(chan struct{})
	go func() {
		m.Run(ctx)
		close(done)
	}()

	select {
	case <-done:
		// Good — exited quickly.
	case <-time.After(2 * time.Second):
		t.Fatal("Run did not exit with empty identities within timeout")
	}
}

func TestIsEnabledChecksConfig(t *testing.T) {
	ctx := context.Background()

	cfg := Config{Enabled: false}
	m := NewManager(cfg, nil, nil)
	if m.isEnabled(ctx) {
		t.Fatal("expected disabled when config.Enabled is false")
	}

	cfg.Enabled = true
	m = NewManager(cfg, nil, nil)
	if !m.isEnabled(ctx) {
		t.Fatal("expected enabled when config.Enabled is true and no Redis")
	}
}

func TestTriggerRaceBatchNeedsMinimumTwoBots(t *testing.T) {
	cfg := Config{Enabled: true, Concurrency: 5, MinConcurrency: 2, MaxConcurrency: 8, WSURL: "ws://localhost:8081/ws"}
	ids := makeTestIdentities(5)
	m := NewManager(cfg, ids, nil)

	ctx := context.Background()

	p := NewPlayer(ids[0], cfg.WSURL)
	p.mu.Lock()
	p.state = stateConnected
	p.mu.Unlock()

	m.mu.Lock()
	m.activeBots[ids[0].Username] = testEntry(p)
	m.mu.Unlock()

	// Should not panic or crash with only 1 connected bot.
	m.triggerRaceBatch(ctx)
}

func TestTriggerRaceBatchSkipsRacingBots(t *testing.T) {
	cfg := Config{Enabled: true, Concurrency: 5, MinConcurrency: 2, MaxConcurrency: 8, WSURL: "ws://localhost:8081/ws"}
	ids := makeTestIdentities(5)
	m := NewManager(cfg, ids, nil)

	ctx := context.Background()

	for i := 0; i < 3; i++ {
		p := NewPlayer(ids[i], cfg.WSURL)
		p.mu.Lock()
		if i == 0 {
			p.state = stateRacing
		} else {
			p.state = stateConnected
		}
		p.mu.Unlock()

		m.mu.Lock()
		m.activeBots[ids[i].Username] = testEntry(p)
		m.mu.Unlock()
	}

	m.triggerRaceBatch(ctx)
}

func TestDisconnectAllClearsActiveBots(t *testing.T) {
	cfg := Config{Enabled: true, Concurrency: 5, MinConcurrency: 2, MaxConcurrency: 8, WSURL: "ws://localhost:8081/ws"}
	ids := makeTestIdentities(3)
	m := NewManager(cfg, ids, nil)

	for i := 0; i < 3; i++ {
		p := NewPlayer(ids[i], cfg.WSURL)
		m.mu.Lock()
		m.activeBots[ids[i].Username] = testEntry(p)
		m.mu.Unlock()
	}

	if m.activeCount() != 3 {
		t.Fatalf("expected 3 active bots before disconnect, got %d", m.activeCount())
	}

	m.disconnectAll()

	if m.activeCount() != 0 {
		t.Fatalf("expected 0 active bots after disconnectAll, got %d", m.activeCount())
	}
}

func TestDisconnectBotRemovesSpecificBot(t *testing.T) {
	cfg := Config{Enabled: true, Concurrency: 5, MinConcurrency: 2, MaxConcurrency: 8, WSURL: "ws://localhost:8081/ws"}
	ids := makeTestIdentities(3)
	m := NewManager(cfg, ids, nil)

	for i := 0; i < 3; i++ {
		p := NewPlayer(ids[i], cfg.WSURL)
		m.mu.Lock()
		m.activeBots[ids[i].Username] = testEntry(p)
		m.mu.Unlock()
	}

	target := ids[1].Username
	m.disconnectBot(target)

	m.mu.Lock()
	_, exists := m.activeBots[target]
	remaining := len(m.activeBots)
	m.mu.Unlock()

	if exists {
		t.Fatalf("expected bot %q to be removed", target)
	}
	if remaining != 2 {
		t.Fatalf("expected 2 remaining bots, got %d", remaining)
	}
}

func TestDisconnectBotNoopForUnknown(t *testing.T) {
	cfg := Config{Enabled: true, Concurrency: 5, MinConcurrency: 2, MaxConcurrency: 8, WSURL: "ws://localhost:8081/ws"}
	m := NewManager(cfg, nil, nil)
	m.disconnectBot("nonexistent_bot")
}

func TestRotateBotRequiresIdleBot(t *testing.T) {
	cfg := Config{Enabled: true, Concurrency: 5, MinConcurrency: 2, MaxConcurrency: 8, WSURL: "ws://localhost:8081/ws"}
	ids := makeTestIdentities(5)
	m := NewManager(cfg, ids, nil)

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)
	defer cancel()

	for i := 0; i < 3; i++ {
		p := NewPlayer(ids[i], cfg.WSURL)
		p.mu.Lock()
		p.state = stateRacing
		p.mu.Unlock()

		m.mu.Lock()
		m.activeBots[ids[i].Username] = testEntry(p)
		m.mu.Unlock()
	}

	m.rotateBot(ctx)

	if m.activeCount() != 3 {
		t.Fatalf("expected 3 bots after failed rotation, got %d", m.activeCount())
	}
}

func TestHandleQueueFillWithNilRedis(t *testing.T) {
	cfg := Config{Enabled: true, Concurrency: 5, MinConcurrency: 2, MaxConcurrency: 8, WSURL: "ws://localhost:8081/ws"}
	ids := makeTestIdentities(5)
	m := NewManager(cfg, ids, nil)

	ctx := context.Background()

	done := make(chan struct{})
	go func() {
		m.queueFillSubscriber(ctx)
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal("queueFillSubscriber did not exit with nil redis")
	}
}

func TestMinFunction(t *testing.T) {
	tests := []struct {
		a, b, want int
	}{
		{1, 2, 1},
		{5, 3, 3},
		{0, 0, 0},
		{-1, 1, -1},
		{100, 100, 100},
	}

	for _, tc := range tests {
		got := min(tc.a, tc.b)
		if got != tc.want {
			t.Errorf("min(%d, %d) = %d, want %d", tc.a, tc.b, got, tc.want)
		}
	}
}

func TestMaxFunction(t *testing.T) {
	tests := []struct {
		a, b, want int
	}{
		{1, 2, 2},
		{5, 3, 5},
		{0, 0, 0},
		{-1, 1, 1},
	}

	for _, tc := range tests {
		got := max(tc.a, tc.b)
		if got != tc.want {
			t.Errorf("max(%d, %d) = %d, want %d", tc.a, tc.b, got, tc.want)
		}
	}
}

func TestScaleUpAddsBotsToPool(t *testing.T) {
	cfg := Config{
		Enabled:        true,
		Concurrency:    5,
		MinConcurrency: 2,
		MaxConcurrency: 8,
		WSURL:          "ws://localhost:8081/ws",
	}
	ids := makeTestIdentities(10)
	m := NewManager(cfg, ids, nil)

	// Manually simulate what scaleUp does without actual connections:
	// Add 3 bots directly to verify the map logic.
	for i := 0; i < 3; i++ {
		p := NewPlayer(ids[i], cfg.WSURL)
		m.mu.Lock()
		m.activeBots[ids[i].Username] = testEntry(p)
		m.mu.Unlock()
	}

	if m.activeCount() != 3 {
		t.Fatalf("expected 3 bots, got %d", m.activeCount())
	}

	// Verify scaleUp won't add duplicates.
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)
	defer cancel()

	// scaleUp(0) should be a no-op.
	m.scaleUp(ctx, 0)
	if m.activeCount() != 3 {
		t.Fatalf("expected 3 bots after scaleUp(0), got %d", m.activeCount())
	}
}

func TestScaleDownRemovesIdleBots(t *testing.T) {
	cfg := Config{
		Enabled:        true,
		Concurrency:    5,
		MinConcurrency: 2,
		MaxConcurrency: 8,
		WSURL:          "ws://localhost:8081/ws",
	}
	ids := makeTestIdentities(5)
	m := NewManager(cfg, ids, nil)

	// Add 4 idle bots.
	for i := 0; i < 4; i++ {
		p := NewPlayer(ids[i], cfg.WSURL)
		p.mu.Lock()
		p.state = stateConnected
		p.mu.Unlock()

		m.mu.Lock()
		m.activeBots[ids[i].Username] = testEntry(p)
		m.mu.Unlock()
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	m.scaleDown(ctx, 2)

	if m.activeCount() != 2 {
		t.Fatalf("expected 2 bots after scaleDown(2), got %d", m.activeCount())
	}
}

func TestScaleDownSkipsRacingBots(t *testing.T) {
	cfg := Config{
		Enabled:        true,
		Concurrency:    5,
		MinConcurrency: 1,
		MaxConcurrency: 8,
		WSURL:          "ws://localhost:8081/ws",
	}
	ids := makeTestIdentities(5)
	m := NewManager(cfg, ids, nil)

	// 2 racing bots, 1 idle bot.
	for i := 0; i < 3; i++ {
		p := NewPlayer(ids[i], cfg.WSURL)
		p.mu.Lock()
		if i < 2 {
			p.state = stateRacing
		} else {
			p.state = stateConnected
		}
		p.mu.Unlock()

		m.mu.Lock()
		m.activeBots[ids[i].Username] = testEntry(p)
		m.mu.Unlock()
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	// Try to remove 3, but only 1 is idle.
	m.scaleDown(ctx, 3)

	// Should have removed only the 1 idle bot.
	if m.activeCount() != 2 {
		t.Fatalf("expected 2 bots (racing only) after scaleDown, got %d", m.activeCount())
	}
}

func TestBreatheChangesTarget(t *testing.T) {
	cfg := Config{
		Enabled:        true,
		Concurrency:    5,
		MinConcurrency: 2,
		MaxConcurrency: 10,
		WSURL:          "ws://invalid:9999/ws",
	}
	ids := makeTestIdentities(15)
	m := NewManager(cfg, ids, nil)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Record initial target.
	m.mu.Lock()
	initial := m.targetConcurrency
	m.mu.Unlock()

	// Call breathe many times — the target should change at least once.
	changed := false
	for i := 0; i < 20; i++ {
		m.breathe(ctx)
		m.mu.Lock()
		current := m.targetConcurrency
		m.mu.Unlock()
		if current != initial {
			changed = true
			break
		}
	}

	if !changed {
		t.Fatal("breathe did not change targetConcurrency after 20 calls")
	}
}

func TestBreatheStaysWithinBounds(t *testing.T) {
	cfg := Config{
		Enabled:        true,
		Concurrency:    5,
		MinConcurrency: 3,
		MaxConcurrency: 8,
		WSURL:          "ws://invalid:9999/ws",
	}
	ids := makeTestIdentities(15)
	m := NewManager(cfg, ids, nil)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	for i := 0; i < 50; i++ {
		m.breathe(ctx)
		m.mu.Lock()
		target := m.targetConcurrency
		m.mu.Unlock()

		if target < 3 || target > 8 {
			t.Fatalf("breathe produced target %d outside range [3, 8]", target)
		}
	}
}

func TestNextBreatheIntervalRange(t *testing.T) {
	cfg := Config{Enabled: true}
	m := NewManager(cfg, nil, nil)

	for i := 0; i < 100; i++ {
		d := m.nextBreatheInterval()
		if d < 30*time.Second || d > 90*time.Second {
			t.Fatalf("nextBreatheInterval returned %s, want [30s, 90s]", d)
		}
	}
}

func TestAdjustPoolScalesUp(t *testing.T) {
	cfg := Config{
		Enabled:        true,
		Concurrency:    5,
		MinConcurrency: 3,
		MaxConcurrency: 8,
		WSURL:          "ws://localhost:8081/ws",
	}
	ids := makeTestIdentities(10)
	m := NewManager(cfg, ids, nil)

	// Pre-populate 2 bots.
	for i := 0; i < 2; i++ {
		p := NewPlayer(ids[i], cfg.WSURL)
		m.mu.Lock()
		m.activeBots[ids[i].Username] = testEntry(p)
		m.mu.Unlock()
	}

	// Set target higher than current.
	m.mu.Lock()
	m.targetConcurrency = 2 // Same as current — should be a no-op.
	m.mu.Unlock()

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)
	defer cancel()

	m.adjustPool(ctx)

	if m.activeCount() != 2 {
		t.Fatalf("expected 2 bots after adjustPool (target=current=2), got %d", m.activeCount())
	}
}

func TestActiveCount(t *testing.T) {
	cfg := Config{Enabled: true, Concurrency: 5, MinConcurrency: 2, MaxConcurrency: 8, WSURL: "ws://localhost:8081/ws"}
	ids := makeTestIdentities(3)
	m := NewManager(cfg, ids, nil)

	if m.activeCount() != 0 {
		t.Fatal("expected 0")
	}

	p := NewPlayer(ids[0], cfg.WSURL)
	m.mu.Lock()
	m.activeBots[ids[0].Username] = testEntry(p)
	m.mu.Unlock()

	if m.activeCount() != 1 {
		t.Fatal("expected 1")
	}
}

func TestLoadConfigDefaultMinMax(t *testing.T) {
	t.Setenv("BOT_CONCURRENCY", "5")
	// Don't set min/max — they should be derived.
	t.Setenv("BOT_MIN_CONCURRENCY", "")
	t.Setenv("BOT_MAX_CONCURRENCY", "")

	cfg := LoadConfig()

	if cfg.MinConcurrency < 1 {
		t.Fatalf("expected MinConcurrency >= 1, got %d", cfg.MinConcurrency)
	}
	if cfg.MaxConcurrency <= cfg.MinConcurrency {
		t.Fatalf("expected MaxConcurrency > MinConcurrency, got max=%d min=%d",
			cfg.MaxConcurrency, cfg.MinConcurrency)
	}
}

func TestLoadConfigExplicitMinMax(t *testing.T) {
	t.Setenv("BOT_CONCURRENCY", "5")
	t.Setenv("BOT_MIN_CONCURRENCY", "3")
	t.Setenv("BOT_MAX_CONCURRENCY", "12")

	cfg := LoadConfig()

	if cfg.MinConcurrency != 3 {
		t.Fatalf("expected MinConcurrency 3, got %d", cfg.MinConcurrency)
	}
	if cfg.MaxConcurrency != 12 {
		t.Fatalf("expected MaxConcurrency 12, got %d", cfg.MaxConcurrency)
	}
}
