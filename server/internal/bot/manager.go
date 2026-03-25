package bot

import (
	"context"
	"log"
	"math/rand"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

// botEntry tracks a connected bot player and its lifecycle control channel.
type botEntry struct {
	player *Player
	done   chan struct{} // closed by disconnectBot to stop the reconnect goroutine
}

// Manager orchestrates a pool of bot players: connects/disconnects them,
// schedules races, rotates active bots, and handles the admin toggle.
// The online count "breathes" — fluctuating between MinConcurrency and
// MaxConcurrency at random intervals so the platform looks alive.
type Manager struct {
	cfg        Config
	identities []BotIdentity
	redis      *redis.Client

	mu                sync.Mutex
	activeBots        map[string]*botEntry // username -> active bot entry
	targetConcurrency int                  // current desired online count (fluctuates)
	hubRotationIdx    int                  // cycles through allHubs for race batches
	stopRotate        context.CancelFunc
}

// NewManager creates a bot manager with the given config and identity pool.
func NewManager(cfg Config, identities []BotIdentity, redisClient *redis.Client) *Manager {
	// Clamp max concurrency to available identities.
	maxC := cfg.MaxConcurrency
	if maxC > len(identities) && len(identities) > 0 {
		maxC = len(identities)
	}
	minC := cfg.MinConcurrency
	if minC > maxC {
		minC = maxC
	}
	cfg.MinConcurrency = minC
	cfg.MaxConcurrency = maxC

	// Start at a random point within the range.
	initial := minC
	if maxC > minC {
		initial = minC + rand.Intn(maxC-minC+1)
	}

	return &Manager{
		cfg:               cfg,
		identities:        identities,
		redis:             redisClient,
		activeBots:        make(map[string]*botEntry),
		targetConcurrency: initial,
	}
}

// Run starts the manager loop. It blocks until the context is cancelled.
func (m *Manager) Run(ctx context.Context) {
	if len(m.identities) == 0 {
		log.Printf("[bot-manager] no bot identities loaded, exiting")
		return
	}

	log.Printf("[bot-manager] starting with %d identities, concurrency=%d [%d-%d], race_interval=%s",
		len(m.identities), m.targetConcurrency, m.cfg.MinConcurrency, m.cfg.MaxConcurrency, m.cfg.RaceInterval)

	// Subscribe to queue-fill notifications.
	go m.queueFillSubscriber(ctx)

	// Start the main scheduling loop.
	m.scheduleLoop(ctx)
}

// scheduleLoop is the main loop that manages bot lifecycle.
func (m *Manager) scheduleLoop(ctx context.Context) {
	// Initial ramp-up: connect bots to reach the starting target.
	m.adjustPool(ctx)

	raceTicker := time.NewTicker(m.cfg.RaceInterval)
	defer raceTicker.Stop()

	rotateTicker := time.NewTicker(10 * time.Minute)
	defer rotateTicker.Stop()

	toggleTicker := time.NewTicker(30 * time.Second)
	defer toggleTicker.Stop()

	// Breathing: pick a random interval between 30-90s to change the target.
	breatheTimer := time.NewTimer(m.nextBreatheInterval())
	defer breatheTimer.Stop()

	for {
		select {
		case <-ctx.Done():
			m.disconnectAll()
			return

		case <-toggleTicker.C:
			if !m.isEnabled(ctx) {
				m.disconnectAll()
				// Wait until re-enabled.
				m.waitForEnable(ctx)
				if ctx.Err() != nil {
					return
				}
				m.adjustPool(ctx)
			}

		case <-breatheTimer.C:
			if m.isEnabled(ctx) {
				m.breathe(ctx)
			}
			breatheTimer.Reset(m.nextBreatheInterval())

		case <-raceTicker.C:
			if m.isEnabled(ctx) {
				m.triggerRaceBatch(ctx)
			}

		case <-rotateTicker.C:
			if m.isEnabled(ctx) {
				m.rotateBot(ctx)
			}
		}
	}
}

// nextBreatheInterval returns a random duration between 30-90 seconds.
func (m *Manager) nextBreatheInterval() time.Duration {
	return time.Duration(30+rand.Intn(61)) * time.Second
}

// breathe randomly adjusts the target concurrency up or down by 1-3 bots,
// then connects or disconnects to match. This makes the online count
// fluctuate naturally.
func (m *Manager) breathe(ctx context.Context) {
	m.mu.Lock()
	current := len(m.activeBots)
	oldTarget := m.targetConcurrency
	m.mu.Unlock()

	minC := m.cfg.MinConcurrency
	maxC := m.cfg.MaxConcurrency

	// Decide direction: slight bias toward the midpoint to avoid lingering
	// at extremes.
	mid := (minC + maxC) / 2
	var newTarget int
	if oldTarget <= minC {
		// At the floor — must go up.
		newTarget = oldTarget + 1 + rand.Intn(2) // +1 or +2
	} else if oldTarget >= maxC {
		// At the ceiling — must go down.
		newTarget = oldTarget - 1 - rand.Intn(2) // -1 or -2
	} else {
		// Somewhere in the middle — biased random walk.
		// 60% chance to move toward mid, 40% away.
		delta := 1 + rand.Intn(2) // 1 or 2
		if oldTarget < mid {
			if rand.Float64() < 0.60 {
				newTarget = oldTarget + delta
			} else {
				newTarget = oldTarget - delta
			}
		} else {
			if rand.Float64() < 0.60 {
				newTarget = oldTarget - delta
			} else {
				newTarget = oldTarget + delta
			}
		}
	}

	// Clamp.
	if newTarget < minC {
		newTarget = minC
	}
	if newTarget > maxC {
		newTarget = maxC
	}

	if newTarget == oldTarget {
		return
	}

	m.mu.Lock()
	m.targetConcurrency = newTarget
	m.mu.Unlock()

	log.Printf("[bot-manager] breathing: %d -> %d online (current=%d)", oldTarget, newTarget, current)
	m.adjustPool(ctx)
}

// adjustPool connects or disconnects bots to match the current targetConcurrency.
func (m *Manager) adjustPool(ctx context.Context) {
	m.mu.Lock()
	target := m.targetConcurrency
	current := len(m.activeBots)
	m.mu.Unlock()

	if current < target {
		m.scaleUp(ctx, target-current)
	} else if current > target {
		m.scaleDown(ctx, current-target)
	}
}

// scaleUp connects `count` new bots with staggered delays.
func (m *Manager) scaleUp(ctx context.Context, count int) {
	if count <= 0 {
		return
	}

	// Shuffle identities to pick different bots each time.
	shuffled := make([]BotIdentity, len(m.identities))
	copy(shuffled, m.identities)
	rand.Shuffle(len(shuffled), func(i, j int) {
		shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
	})

	connected := 0
	for _, id := range shuffled {
		if ctx.Err() != nil {
			return
		}

		m.mu.Lock()
		_, exists := m.activeBots[id.Username]
		m.mu.Unlock()

		if exists {
			continue
		}

		m.connectBot(ctx, id)
		connected++
		log.Printf("[bot-manager] +1 bot: %s (now %d online)", id.Username, m.activeCount())

		if connected >= count {
			break
		}

		// Stagger connections by 2-8 seconds for natural appearance.
		delay := time.Duration(2000+rand.Intn(6000)) * time.Millisecond
		select {
		case <-ctx.Done():
			return
		case <-time.After(delay):
		}
	}
}

// scaleDown disconnects `count` idle bots with staggered delays.
func (m *Manager) scaleDown(ctx context.Context, count int) {
	removed := 0
	for removed < count {
		if ctx.Err() != nil {
			return
		}

		// Find an idle (connected, not racing) bot to remove.
		m.mu.Lock()
		var toRemove string
		for name, entry := range m.activeBots {
			if entry.player.State() == stateConnected {
				toRemove = name
				break
			}
		}
		m.mu.Unlock()

		if toRemove == "" {
			break // No idle bots to remove.
		}

		m.disconnectBot(toRemove)
		removed++
		log.Printf("[bot-manager] -1 bot: %s (now %d online)", toRemove, m.activeCount())

		if removed < count {
			// Stagger disconnections by 3-10 seconds.
			delay := time.Duration(3000+rand.Intn(7000)) * time.Millisecond
			select {
			case <-ctx.Done():
				return
			case <-time.After(delay):
			}
		}
	}
}

// activeCount returns the current number of active bots (thread-safe).
func (m *Manager) activeCount() int {
	m.mu.Lock()
	defer m.mu.Unlock()
	return len(m.activeBots)
}

// connectBot starts a bot player in a background goroutine.
func (m *Manager) connectBot(ctx context.Context, id BotIdentity) {
	player := NewPlayer(id, m.cfg.WSURL)
	done := make(chan struct{})

	m.mu.Lock()
	m.activeBots[id.Username] = &botEntry{player: player, done: done}
	m.mu.Unlock()

	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			case <-done:
				return
			default:
			}

			err := player.Connect(ctx)

			select {
			case <-ctx.Done():
				return
			case <-done:
				return
			default:
			}

			// Connection lost — attempt reconnect with backoff.
			if err != nil {
				log.Printf("[bot-manager] %s disconnected: %v", id.Username, err)
			}

			m.mu.Lock()
			_, stillActive := m.activeBots[id.Username]
			m.mu.Unlock()

			if !stillActive {
				// Bot was explicitly removed (rotation/shutdown).
				return
			}

			// Exponential backoff: 1s, 2s, 4s, 8s, max 30s.
			backoff := time.Duration(1+rand.Intn(2)) * time.Second
			reconnected := false
			for attempt := 0; attempt < 5; attempt++ {
				select {
				case <-ctx.Done():
					return
				case <-done:
					return
				case <-time.After(backoff):
				}

				// Re-check whether we've been removed during backoff.
				m.mu.Lock()
				_, stillActive = m.activeBots[id.Username]
				m.mu.Unlock()
				if !stillActive {
					return
				}

				err = player.Connect(ctx)
				if err == nil {
					reconnected = true
					break
				}
				if ctx.Err() != nil {
					return
				}
				select {
				case <-done:
					return
				default:
				}

				backoff *= 2
				if backoff > 30*time.Second {
					backoff = 30 * time.Second
				}
			}

			if ctx.Err() != nil {
				return
			}
			select {
			case <-done:
				return
			default:
			}

			// If all retries failed, remove self from active bots and give up.
			if !reconnected {
				log.Printf("[bot-manager] %s: all reconnect attempts failed, giving up", id.Username)
				m.mu.Lock()
				delete(m.activeBots, id.Username)
				m.mu.Unlock()
				return
			}
		}
	}()
}

// disconnectBot removes and disconnects a specific bot.
func (m *Manager) disconnectBot(username string) {
	m.mu.Lock()
	entry, ok := m.activeBots[username]
	if ok {
		delete(m.activeBots, username)
	}
	m.mu.Unlock()

	if ok && entry != nil {
		close(entry.done) // signal reconnect goroutine to stop
		entry.player.Disconnect()
	}
}

// disconnectAll gracefully disconnects all active bots.
func (m *Manager) disconnectAll() {
	m.mu.Lock()
	bots := make(map[string]*botEntry, len(m.activeBots))
	for k, v := range m.activeBots {
		bots[k] = v
	}
	m.activeBots = make(map[string]*botEntry)
	m.mu.Unlock()

	for username, entry := range bots {
		log.Printf("[bot-manager] disconnecting %s", username)
		close(entry.done)
		entry.player.Disconnect()
	}

	log.Printf("[bot-manager] all bots disconnected")
}

// triggerRaceBatch picks 2-4 connected bots and makes them queue for the same hub.
func (m *Manager) triggerRaceBatch(ctx context.Context) {
	m.mu.Lock()
	var connected []*Player
	for _, entry := range m.activeBots {
		if entry.player.State() == stateConnected {
			connected = append(connected, entry.player)
		}
	}
	m.mu.Unlock()

	if len(connected) < 2 {
		return
	}

	// Shuffle and pick 2-4 bots.
	rand.Shuffle(len(connected), func(i, j int) {
		connected[i], connected[j] = connected[j], connected[i]
	})

	batchSize := 2 + rand.Intn(min(3, len(connected)-1))
	if batchSize > len(connected) {
		batchSize = len(connected)
	}

	batch := connected[:batchSize]

	// Rotate through all hubs to ensure even coverage, with occasional
	// random picks for variety.
	var hub string
	if rand.Float64() < 0.30 {
		// 30% chance: use a bot's preferred hub for natural-looking bias.
		hub = batch[0].PickHub()
	} else {
		// 70% chance: rotate through allHubs sequentially.
		m.mu.Lock()
		hub = allHubs[m.hubRotationIdx%len(allHubs)]
		m.hubRotationIdx++
		m.mu.Unlock()
	}

	log.Printf("[bot-manager] triggering race batch: %d bots in hub=%s", batchSize, hub)

	for _, p := range batch {
		if err := p.QueueForRace(hub); err != nil {
			log.Printf("[bot-manager] failed to queue %s: %v", p.identity.Username, err)
		}

		// Small stagger between queue joins so they don't look synchronised.
		select {
		case <-ctx.Done():
			return
		case <-time.After(time.Duration(500+rand.Intn(1500)) * time.Millisecond):
		}
	}
}

// rotateBot swaps one active bot for an inactive one, keeping things fresh.
func (m *Manager) rotateBot(ctx context.Context) {
	m.mu.Lock()
	activeNames := make(map[string]struct{})
	var toRemove string
	for name := range m.activeBots {
		activeNames[name] = struct{}{}
		// Pick a random active bot to remove (that's not currently racing).
		if toRemove == "" {
			if entry, ok := m.activeBots[name]; ok && entry.player.State() == stateConnected {
				toRemove = name
			}
		}
	}
	m.mu.Unlock()

	if toRemove == "" {
		return
	}

	// Find a replacement identity.
	var replacement *BotIdentity
	shuffled := make([]BotIdentity, len(m.identities))
	copy(shuffled, m.identities)
	rand.Shuffle(len(shuffled), func(i, j int) {
		shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
	})

	for i := range shuffled {
		if _, active := activeNames[shuffled[i].Username]; !active {
			replacement = &shuffled[i]
			break
		}
	}

	if replacement == nil {
		return
	}

	log.Printf("[bot-manager] rotating: %s -> %s", toRemove, replacement.Username)
	m.disconnectBot(toRemove)

	// Small delay before connecting replacement.
	select {
	case <-ctx.Done():
		return
	case <-time.After(time.Duration(1000+rand.Intn(3000)) * time.Millisecond):
	}

	m.connectBot(ctx, *replacement)
}

// isEnabled checks both the env config and the Redis runtime toggle.
func (m *Manager) isEnabled(ctx context.Context) bool {
	if !m.cfg.Enabled {
		return false
	}

	if m.redis != nil {
		val, err := m.redis.Get(ctx, "platform:bot_enabled").Result()
		if err == nil && val == "false" {
			return false
		}
	}

	return true
}

// waitForEnable blocks until bots are re-enabled or context is cancelled.
func (m *Manager) waitForEnable(ctx context.Context) {
	log.Printf("[bot-manager] bots disabled, waiting for re-enable...")
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if m.isEnabled(ctx) {
				log.Printf("[bot-manager] bots re-enabled")
				return
			}
		}
	}
}

// queueFillSubscriber listens for Redis pub/sub notifications to fill
// queues where real users are waiting.
func (m *Manager) queueFillSubscriber(ctx context.Context) {
	if m.redis == nil {
		return
	}

	pubsub := m.redis.Subscribe(ctx, "bot:queue_fill")
	defer func() {
		_ = pubsub.Close()
	}()

	ch := pubsub.Channel()
	for {
		select {
		case <-ctx.Done():
			return
		case msg, ok := <-ch:
			if !ok {
				return
			}
			m.handleQueueFill(ctx, msg.Payload)
		}
	}
}

// handleQueueFill dispatches a bot to fill a queue where a real user is waiting.
// Payload format: "hub|mode|capacity" (e.g. "go|sprint|2").
func (m *Manager) handleQueueFill(ctx context.Context, payload string) {
	// Parse hub from payload.
	hub := payload
	// For now just use the raw payload as the hub name.
	// The queue-fill publisher sends just the hub slug.

	log.Printf("[bot-manager] queue-fill request for hub=%s", hub)

	// Find a connected idle bot.
	m.mu.Lock()
	var candidate *Player
	for _, entry := range m.activeBots {
		if entry.player.State() == stateConnected {
			candidate = entry.player
			break
		}
	}
	m.mu.Unlock()

	if candidate == nil {
		// No idle bots — connect a new one using the proper lifecycle.
		if len(m.identities) > 0 {
			// Find an inactive identity to avoid conflicts.
			shuffled := make([]BotIdentity, len(m.identities))
			copy(shuffled, m.identities)
			rand.Shuffle(len(shuffled), func(i, j int) {
				shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
			})

			var picked *BotIdentity
			m.mu.Lock()
			for i := range shuffled {
				if _, active := m.activeBots[shuffled[i].Username]; !active {
					picked = &shuffled[i]
					break
				}
			}
			m.mu.Unlock()

			if picked == nil {
				log.Printf("[bot-manager] queue-fill: no inactive identities available")
				return
			}

			m.connectBot(ctx, *picked)

			// Wait for connection to establish.
			select {
			case <-ctx.Done():
				return
			case <-time.After(3 * time.Second):
			}

			// Re-find the bot we just connected.
			m.mu.Lock()
			if entry, ok := m.activeBots[picked.Username]; ok {
				candidate = entry.player
			}
			m.mu.Unlock()

			if candidate == nil || candidate.State() < stateConnected {
				log.Printf("[bot-manager] queue-fill: bot %s failed to connect in time", picked.Username)
				return
			}
		} else {
			return
		}
	}

	if err := candidate.QueueForRace(hub); err != nil {
		log.Printf("[bot-manager] queue-fill failed: %v", err)
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
