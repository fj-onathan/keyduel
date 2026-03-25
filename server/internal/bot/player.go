package bot

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"math/rand"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// playerState tracks what phase the bot is currently in.
type playerState int

const (
	stateDisconnected playerState = iota
	stateConnected
	stateQueued
	stateInRoom
	stateCountdown
	stateRacing
	stateFinished
)

// Player is a single bot instance that connects via WebSocket and simulates
// typing in races. It follows the exact same protocol as a real client.
type Player struct {
	identity BotIdentity
	wsURL    string

	mu       sync.Mutex
	state    playerState
	conn     *websocket.Conn
	clientID string
	roomID   string
	raceID   string
	snippet  string
	cancel   context.CancelFunc

	// Racing state
	progress    int
	errors      int
	raceStarted time.Time
}

// NewPlayer creates a bot player for the given identity.
func NewPlayer(identity BotIdentity, wsURL string) *Player {
	return &Player{
		identity: identity,
		wsURL:    wsURL,
		state:    stateDisconnected,
	}
}

// wsEvent mirrors the server's event structure for JSON marshalling.
type wsEvent struct {
	Type         string          `json:"type"`
	ClientID     string          `json:"clientId,omitempty"`
	Hub          string          `json:"hub,omitempty"`
	Mode         string          `json:"mode,omitempty"`
	Capacity     int             `json:"capacity,omitempty"`
	RoomID       string          `json:"roomId,omitempty"`
	RaceID       string          `json:"raceId,omitempty"`
	Snippet      string          `json:"snippet,omitempty"`
	SnippetLen   int             `json:"snippetLen,omitempty"`
	Countdown    int             `json:"countdown,omitempty"`
	SessionToken string          `json:"sessionToken,omitempty"`
	QueueKey     string          `json:"queueKey,omitempty"`
	Position     int             `json:"position,omitempty"`
	Message      string          `json:"message,omitempty"`
	Connected    int             `json:"connected,omitempty"`
	Progress     int             `json:"progress,omitempty"`
	Errors       int             `json:"errors,omitempty"`
	Participants json.RawMessage `json:"participants,omitempty"`
	Results      json.RawMessage `json:"results,omitempty"`
	DurationMS   int64           `json:"durationMs,omitempty"`
}

// Connect establishes a WebSocket connection to the race-engine and starts
// the read loop. Returns after the connection is closed or context is cancelled.
func (p *Player) Connect(ctx context.Context) error {
	ctx, cancel := context.WithCancel(ctx)
	p.mu.Lock()
	p.cancel = cancel
	p.mu.Unlock()
	defer cancel()

	url := fmt.Sprintf("%s?guestId=%s", p.wsURL, p.identity.Username)
	conn, _, err := websocket.DefaultDialer.DialContext(ctx, url, nil)
	if err != nil {
		return fmt.Errorf("dial %s: %w", p.identity.Username, err)
	}

	p.mu.Lock()
	p.conn = conn
	p.state = stateConnected
	p.mu.Unlock()

	defer func() {
		_ = conn.Close()
		p.mu.Lock()
		p.conn = nil
		p.state = stateDisconnected
		p.mu.Unlock()
	}()

	// Start pong handler to keep connection alive.
	conn.SetPongHandler(func(string) error {
		_ = conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})
	_ = conn.SetReadDeadline(time.Now().Add(60 * time.Second))

	// Start ping sender.
	go p.pingLoop(ctx, conn)

	// Read loop — processes all server messages.
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		_, message, err := conn.ReadMessage()
		if err != nil {
			if ctx.Err() != nil {
				return ctx.Err()
			}
			return fmt.Errorf("read %s: %w", p.identity.Username, err)
		}

		_ = conn.SetReadDeadline(time.Now().Add(60 * time.Second))

		var event wsEvent
		if err := json.Unmarshal(message, &event); err != nil {
			continue
		}

		p.handleServerEvent(ctx, event)
	}
}

// Disconnect gracefully closes the bot's connection.
func (p *Player) Disconnect() {
	p.mu.Lock()
	defer p.mu.Unlock()

	if p.cancel != nil {
		p.cancel()
	}
	if p.conn != nil {
		_ = p.conn.WriteMessage(
			websocket.CloseMessage,
			websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""),
		)
	}
}

// State returns the current player state (thread-safe).
func (p *Player) State() playerState {
	p.mu.Lock()
	defer p.mu.Unlock()
	return p.state
}

// QueueForRace sends a queue_race message for the specified hub.
func (p *Player) QueueForRace(hub string) error {
	p.mu.Lock()
	conn := p.conn
	state := p.state
	p.mu.Unlock()

	if conn == nil || state < stateConnected {
		return fmt.Errorf("not connected")
	}

	msg := wsEvent{
		Type:     "queue_race",
		Hub:      hub,
		Mode:     "sprint",
		Capacity: 2,
	}

	data, _ := json.Marshal(msg)
	if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
		return fmt.Errorf("send queue_race: %w", err)
	}

	p.mu.Lock()
	p.state = stateQueued
	p.mu.Unlock()

	return nil
}

// handleServerEvent processes a single server message and transitions state.
func (p *Player) handleServerEvent(ctx context.Context, event wsEvent) {
	switch event.Type {
	case "connected":
		p.mu.Lock()
		p.clientID = event.ClientID
		p.state = stateConnected
		p.mu.Unlock()
		log.Printf("[bot:%s] connected as %s", p.identity.Username, event.ClientID)

	case "session_assigned":
		// Session is ready, waiting for queue match.

	case "queued":
		p.mu.Lock()
		p.state = stateQueued
		p.mu.Unlock()

	case "room_assigned":
		p.mu.Lock()
		p.roomID = event.RoomID
		p.raceID = event.RaceID
		p.state = stateInRoom
		p.mu.Unlock()
		log.Printf("[bot:%s] matched into room %s", p.identity.Username, event.RoomID)

	case "race_countdown":
		p.mu.Lock()
		p.state = stateCountdown
		p.mu.Unlock()

	case "race_started":
		p.mu.Lock()
		p.snippet = event.Snippet
		p.progress = 0
		p.errors = 0
		p.raceStarted = time.Now()
		p.state = stateRacing
		p.mu.Unlock()
		log.Printf("[bot:%s] race started, snippet len=%d", p.identity.Username, len(event.Snippet))
		go p.simulateTyping(ctx)

	case "race_resumed":
		p.mu.Lock()
		p.snippet = event.Snippet
		p.state = stateRacing
		p.raceStarted = time.Now()
		p.mu.Unlock()
		go p.simulateTyping(ctx)

	case "race_state_update":
		// Normal periodic updates during race — nothing to do.

	case "race_end":
		p.mu.Lock()
		p.state = stateConnected // back to idle so scaleDown/rotation can find this bot
		p.roomID = ""
		p.raceID = ""
		p.snippet = ""
		p.mu.Unlock()
		log.Printf("[bot:%s] race finished", p.identity.Username)

	case "race_cancelled":
		p.mu.Lock()
		p.state = stateConnected
		p.roomID = ""
		p.raceID = ""
		p.mu.Unlock()
		log.Printf("[bot:%s] race cancelled", p.identity.Username)

	case "presence_update", "heartbeat_ack", "error":
		// Ignore.

	case "queue_left":
		p.mu.Lock()
		p.state = stateConnected
		p.mu.Unlock()
	}
}

// simulateTyping sends progress updates at intervals that match the bot's WPM.
// It runs in a goroutine and stops when the race ends or context is cancelled.
func (p *Player) simulateTyping(ctx context.Context) {
	p.mu.Lock()
	snippetLen := len(p.snippet)
	baseWPM := p.identity.BaseWPM
	baseAccuracy := p.identity.BaseAccuracy
	conn := p.conn
	p.mu.Unlock()

	if snippetLen == 0 || conn == nil {
		return
	}

	// Determine if this is a DNF run (~5% chance).
	isDNF := rand.Float64() < 0.05
	targetCompletion := snippetLen
	if isDNF {
		targetCompletion = int(float64(snippetLen) * (0.70 + rand.Float64()*0.25))
	}

	// Per-race WPM variance: +/- 15% around base.
	raceWPM := baseWPM * (0.85 + rand.Float64()*0.30)

	// Characters per second = (WPM * 5) / 60
	charsPerSecond := (raceWPM * 5.0) / 60.0

	// Error probability per character based on accuracy.
	errorProb := (100.0 - baseAccuracy) / 100.0

	// Interval between progress updates (~200-400ms for smooth visuals).
	updateInterval := 300 * time.Millisecond

	// Characters to advance per tick.
	charsPerTick := charsPerSecond * updateInterval.Seconds()

	progress := 0
	errorCount := 0
	fractionalProgress := 0.0

	ticker := time.NewTicker(updateInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
		}

		p.mu.Lock()
		if p.state != stateRacing {
			p.mu.Unlock()
			return
		}
		p.mu.Unlock()

		// Add jitter to chars per tick (+/- 20%).
		jitter := 0.80 + rand.Float64()*0.40
		fractionalProgress += charsPerTick * jitter

		// Track accumulated fractional progress.
		advance := int(fractionalProgress)
		if advance < 1 {
			continue
		}
		fractionalProgress -= float64(advance)

		// Introduce errors based on accuracy tier.
		for i := 0; i < advance; i++ {
			if rand.Float64() < errorProb {
				errorCount++
			}
		}

		progress += advance
		if progress > targetCompletion {
			progress = targetCompletion
		}

		// Send progress update.
		msg := wsEvent{
			Type:     "race_input",
			Progress: progress,
			Errors:   errorCount,
		}
		data, _ := json.Marshal(msg)
		if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
			return
		}

		p.mu.Lock()
		p.progress = progress
		p.errors = errorCount
		p.mu.Unlock()

		// Check if done.
		if progress >= targetCompletion {
			if isDNF {
				log.Printf("[bot:%s] DNF at %d/%d chars", p.identity.Username, progress, snippetLen)
			}
			return
		}
	}
}

// pingLoop sends WebSocket pings at regular intervals to keep the connection alive.
func (p *Player) pingLoop(ctx context.Context, conn *websocket.Conn) {
	ticker := time.NewTicker(25 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			deadline := time.Now().Add(10 * time.Second)
			if err := conn.WriteControl(websocket.PingMessage, nil, deadline); err != nil {
				return
			}
		}
	}
}

// PickHub selects a hub for this bot to race in, weighted toward preferred hubs.
func (p *Player) PickHub() string {
	preferred := p.identity.PreferredHubs
	// 50% chance of preferred hub, 50% chance of random hub.
	if len(preferred) > 0 && rand.Float64() < 0.50 {
		return preferred[rand.Intn(len(preferred))]
	}
	return allHubs[rand.Intn(len(allHubs))]
}

// EstimatedRaceDuration returns the approximate time this bot would take to
// finish a race given a snippet length, useful for scheduling.
func (p *Player) EstimatedRaceDuration(snippetLen int) time.Duration {
	if p.identity.BaseWPM <= 0 {
		return 2 * time.Minute
	}
	// duration = (snippetLen / 5) / WPM minutes
	minutes := (float64(snippetLen) / 5.0) / p.identity.BaseWPM
	seconds := minutes * 60.0
	// Add buffer for countdown (3s) and jitter.
	return time.Duration(math.Ceil(seconds+6)) * time.Second
}
