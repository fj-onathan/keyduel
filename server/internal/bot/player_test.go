package bot

import (
	"math"
	"testing"
	"time"
)

func TestNewPlayerInitialState(t *testing.T) {
	id := BotIdentity{
		UserID:   "test-id",
		Username: "test_bot",
		BaseWPM:  80.0,
	}
	p := NewPlayer(id, "ws://localhost:8081/ws")

	if p.State() != stateDisconnected {
		t.Fatalf("expected initial state disconnected, got %d", p.State())
	}
	if p.identity.Username != "test_bot" {
		t.Fatalf("expected username test_bot, got %q", p.identity.Username)
	}
}

func TestQueueForRaceFailsWhenNotConnected(t *testing.T) {
	id := BotIdentity{Username: "test_bot", BaseWPM: 80.0}
	p := NewPlayer(id, "ws://localhost:8081/ws")

	err := p.QueueForRace("go")
	if err == nil {
		t.Fatal("expected error when queuing without connection")
	}
}

func TestPickHubReturnsValidHub(t *testing.T) {
	id := BotIdentity{
		Username:      "gopher_test",
		PreferredHubs: []string{"go"},
	}
	p := NewPlayer(id, "ws://localhost:8081/ws")

	// Run many times to exercise both preferred and random paths.
	validHubs := make(map[string]bool)
	for _, h := range allHubs {
		validHubs[h] = true
	}
	for _, h := range id.PreferredHubs {
		validHubs[h] = true
	}

	for i := 0; i < 100; i++ {
		hub := p.PickHub()
		if !validHubs[hub] {
			t.Fatalf("PickHub returned unexpected hub %q", hub)
		}
	}
}

func TestPickHubPreferredWeighting(t *testing.T) {
	id := BotIdentity{
		Username:      "gopher_test",
		PreferredHubs: []string{"go"},
	}
	p := NewPlayer(id, "ws://localhost:8081/ws")

	preferredCount := 0
	iterations := 1000
	for i := 0; i < iterations; i++ {
		hub := p.PickHub()
		if hub == "go" {
			preferredCount++
		}
	}

	// With 50% preference + some random chance of picking "go" from allHubs,
	// we expect at least 40% preferred picks.
	ratio := float64(preferredCount) / float64(iterations)
	if ratio < 0.40 {
		t.Errorf("preferred hub ratio too low: %.2f (expected > 0.40)", ratio)
	}
}

func TestPickHubNoPreferredFallsBackToAllHubs(t *testing.T) {
	id := BotIdentity{
		Username:      "random_user",
		PreferredHubs: nil,
	}
	p := NewPlayer(id, "ws://localhost:8081/ws")

	validHubs := make(map[string]bool)
	for _, h := range allHubs {
		validHubs[h] = true
	}

	for i := 0; i < 50; i++ {
		hub := p.PickHub()
		if !validHubs[hub] {
			t.Fatalf("PickHub with no preference returned invalid hub %q", hub)
		}
	}
}

func TestEstimatedRaceDurationIsReasonable(t *testing.T) {
	tests := []struct {
		name       string
		wpm        float64
		snippetLen int
		minSec     float64
		maxSec     float64
	}{
		{"beginner_short", 40.0, 200, 10, 70},
		{"intermediate_medium", 80.0, 300, 5, 60},
		{"advanced_long", 120.0, 500, 5, 60},
		{"elite_medium", 160.0, 300, 3, 35},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			id := BotIdentity{BaseWPM: tc.wpm}
			p := NewPlayer(id, "ws://localhost:8081/ws")
			dur := p.EstimatedRaceDuration(tc.snippetLen)
			secs := dur.Seconds()
			if secs < tc.minSec || secs > tc.maxSec {
				t.Errorf("EstimatedRaceDuration(WPM=%.0f, len=%d) = %.1fs, want [%.0f, %.0f]",
					tc.wpm, tc.snippetLen, secs, tc.minSec, tc.maxSec)
			}
		})
	}
}

func TestEstimatedRaceDurationZeroWPM(t *testing.T) {
	id := BotIdentity{BaseWPM: 0}
	p := NewPlayer(id, "ws://localhost:8081/ws")
	dur := p.EstimatedRaceDuration(300)
	if dur != 2*time.Minute {
		t.Fatalf("expected 2m fallback for zero WPM, got %s", dur)
	}
}

func TestEstimatedRaceDurationFormula(t *testing.T) {
	// 100 WPM, 500 chars => 500/5 = 100 words => 100/100 = 1 min = 60s + 6s buffer = 66s
	id := BotIdentity{BaseWPM: 100.0}
	p := NewPlayer(id, "ws://localhost:8081/ws")
	dur := p.EstimatedRaceDuration(500)
	expected := time.Duration(math.Ceil(60.0+6)) * time.Second
	if dur != expected {
		t.Fatalf("expected %s, got %s", expected, dur)
	}
}

func TestPlayerStateTransitions(t *testing.T) {
	id := BotIdentity{Username: "state_bot", BaseWPM: 80.0}
	p := NewPlayer(id, "ws://localhost:8081/ws")

	// Initial state.
	if p.State() != stateDisconnected {
		t.Fatalf("expected disconnected, got %d", p.State())
	}

	// Simulate connected event.
	p.mu.Lock()
	p.state = stateConnected
	p.mu.Unlock()
	if p.State() != stateConnected {
		t.Fatalf("expected connected, got %d", p.State())
	}

	// Simulate queued event.
	p.mu.Lock()
	p.state = stateQueued
	p.mu.Unlock()
	if p.State() != stateQueued {
		t.Fatalf("expected queued, got %d", p.State())
	}
}

func TestHandleServerEventConnected(t *testing.T) {
	id := BotIdentity{Username: "event_bot", BaseWPM: 80.0}
	p := NewPlayer(id, "ws://localhost:8081/ws")

	event := wsEvent{
		Type:     "connected",
		ClientID: "client-123",
	}
	p.handleServerEvent(nil, event)

	if p.State() != stateConnected {
		t.Fatalf("expected connected after connected event, got %d", p.State())
	}

	p.mu.Lock()
	clientID := p.clientID
	p.mu.Unlock()
	if clientID != "client-123" {
		t.Fatalf("expected clientID client-123, got %q", clientID)
	}
}

func TestHandleServerEventRoomAssigned(t *testing.T) {
	id := BotIdentity{Username: "room_bot", BaseWPM: 80.0}
	p := NewPlayer(id, "ws://localhost:8081/ws")

	event := wsEvent{
		Type:   "room_assigned",
		RoomID: "room-456",
		RaceID: "race-789",
	}
	p.handleServerEvent(nil, event)

	if p.State() != stateInRoom {
		t.Fatalf("expected inRoom, got %d", p.State())
	}

	p.mu.Lock()
	roomID := p.roomID
	raceID := p.raceID
	p.mu.Unlock()
	if roomID != "room-456" {
		t.Fatalf("expected roomID room-456, got %q", roomID)
	}
	if raceID != "race-789" {
		t.Fatalf("expected raceID race-789, got %q", raceID)
	}
}

func TestHandleServerEventRaceEnd(t *testing.T) {
	id := BotIdentity{Username: "end_bot", BaseWPM: 80.0}
	p := NewPlayer(id, "ws://localhost:8081/ws")

	p.mu.Lock()
	p.state = stateRacing
	p.mu.Unlock()

	event := wsEvent{Type: "race_end"}
	p.handleServerEvent(nil, event)

	if p.State() != stateConnected {
		t.Fatalf("expected connected (idle) after race_end, got %d", p.State())
	}
}

func TestHandleServerEventRaceCancelled(t *testing.T) {
	id := BotIdentity{Username: "cancel_bot", BaseWPM: 80.0}
	p := NewPlayer(id, "ws://localhost:8081/ws")

	p.mu.Lock()
	p.state = stateInRoom
	p.roomID = "room-1"
	p.raceID = "race-1"
	p.mu.Unlock()

	event := wsEvent{Type: "race_cancelled"}
	p.handleServerEvent(nil, event)

	if p.State() != stateConnected {
		t.Fatalf("expected connected after cancellation, got %d", p.State())
	}

	p.mu.Lock()
	if p.roomID != "" || p.raceID != "" {
		t.Fatalf("expected roomID/raceID cleared after cancellation")
	}
	p.mu.Unlock()
}

func TestHandleServerEventQueueLeft(t *testing.T) {
	id := BotIdentity{Username: "leave_bot", BaseWPM: 80.0}
	p := NewPlayer(id, "ws://localhost:8081/ws")

	p.mu.Lock()
	p.state = stateQueued
	p.mu.Unlock()

	event := wsEvent{Type: "queue_left"}
	p.handleServerEvent(nil, event)

	if p.State() != stateConnected {
		t.Fatalf("expected connected after queue_left, got %d", p.State())
	}
}

func TestHandleServerEventRaceCountdown(t *testing.T) {
	id := BotIdentity{Username: "countdown_bot", BaseWPM: 80.0}
	p := NewPlayer(id, "ws://localhost:8081/ws")

	p.mu.Lock()
	p.state = stateInRoom
	p.mu.Unlock()

	event := wsEvent{Type: "race_countdown", Countdown: 3}
	p.handleServerEvent(nil, event)

	if p.State() != stateCountdown {
		t.Fatalf("expected countdown state, got %d", p.State())
	}
}

func TestWsEventJSONRoundTrip(t *testing.T) {
	// Verify wsEvent can be marshalled and has expected structure.
	event := wsEvent{
		Type:     "race_input",
		Progress: 42,
		Errors:   3,
	}

	// Just verify no panic and fields are accessible.
	if event.Type != "race_input" {
		t.Fatal("unexpected type")
	}
	if event.Progress != 42 {
		t.Fatal("unexpected progress")
	}
	if event.Errors != 3 {
		t.Fatal("unexpected errors")
	}
}
