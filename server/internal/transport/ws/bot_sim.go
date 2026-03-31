package ws

import (
	"fmt"
	"log"
	"math"
	"math/rand"
	"time"
)

// botProfile defines a bot's display identity.
type botProfile struct {
	DisplayName string
	AvatarURL   string
}

// botPool is the in-memory pool of bot identities available for injection.
// No database dependency — these are purely synthetic participants.
var botPool = []botProfile{
	{DisplayName: "SpeedBot"},
	{DisplayName: "TypeMaster"},
	{DisplayName: "CodeRunner"},
	{DisplayName: "ByteRacer"},
	{DisplayName: "SyntaxSprint"},
	{DisplayName: "KeyStorm"},
	{DisplayName: "CompileBot"},
	{DisplayName: "LoopRunner"},
	{DisplayName: "BitDash"},
	{DisplayName: "NullRacer"},
	{DisplayName: "PixelType"},
	{DisplayName: "StackBot"},
	{DisplayName: "HashRunner"},
	{DisplayName: "ParseDroid"},
	{DisplayName: "CacheRacer"},
}

// botTier defines the WPM and accuracy ranges for a tier.
type botTier struct {
	MinWPM      float64
	MaxWPM      float64
	MinAccuracy float64
	MaxAccuracy float64
}

// botTiers mirrors the tier specs from bot/identity.go.
var botTiers = []struct {
	tier   botTier
	weight int // percentage weight for random selection
}{
	{botTier{30, 60, 93.0, 96.0}, 20},   // Beginner
	{botTier{60, 100, 95.5, 98.0}, 40},  // Intermediate
	{botTier{100, 140, 97.7, 99.0}, 27}, // Advanced
	{botTier{140, 170, 98.8, 99.5}, 13}, // Elite
}

// pickBotTier selects a random tier using the weighted distribution.
func pickBotTier() botTier {
	roll := rand.Intn(100)
	cumulative := 0
	for _, entry := range botTiers {
		cumulative += entry.weight
		if roll < cumulative {
			return entry.tier
		}
	}
	// Fallback to intermediate.
	return botTiers[1].tier
}

// injectBotsLocked adds 2–5 bot participants to the room.
// Must be called with h.mu held.
func (h *Hub) injectBotsLocked(room *raceRoom) int {
	count := 2 + rand.Intn(4) // 2–5 bots

	// Collect names already in use in this room (for dedup).
	usedNames := make(map[string]bool)
	for _, token := range room.Participants {
		if s, ok := h.sessions[token]; ok {
			usedNames[s.DisplayName] = true
		}
	}

	// Shuffle the bot pool.
	shuffled := make([]botProfile, len(botPool))
	copy(shuffled, botPool)
	rand.Shuffle(len(shuffled), func(i, j int) {
		shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
	})

	injected := 0
	for _, profile := range shuffled {
		if injected >= count {
			break
		}
		if usedNames[profile.DisplayName] {
			continue
		}

		tier := pickBotTier()
		baseWPM := tier.MinWPM + rand.Float64()*(tier.MaxWPM-tier.MinWPM)
		baseAcc := tier.MinAccuracy + rand.Float64()*(tier.MaxAccuracy-tier.MinAccuracy)

		token := fmt.Sprintf("bot-%s", newUUID())
		clientID := fmt.Sprintf("bot-%s", profile.DisplayName)

		session := &playerSession{
			Token:       token,
			ClientID:    clientID,
			DisplayName: profile.DisplayName,
			AvatarURL:   profile.AvatarURL,
			RoomID:      room.ID,
			IsBot:       true,
			BotBaseWPM:  baseWPM,
			BotBaseAcc:  baseAcc,
			Accuracy:    100,
		}

		h.sessions[token] = session
		room.Participants = append(room.Participants, token)
		usedNames[profile.DisplayName] = true
		injected++

		log.Printf("[bot-sim] injected %s (WPM=%.0f, Acc=%.1f%%) into room %s",
			profile.DisplayName, baseWPM, baseAcc, room.ID)
	}

	// Broadcast updated participant list so the client sees bots join.
	if injected > 0 {
		h.broadcastRoomLocked(room, ServerEvent{
			Type:         "presence_update",
			RoomID:       room.ID,
			RaceID:       room.RaceID,
			Participants: h.snapshotParticipantsForRoomLocked(room),
			LeaderID:     h.leaderClientIDLocked(room),
			Message:      fmt.Sprintf("%d bot opponents added", injected),
		})
	}

	return injected
}

// launchBotSimulationsLocked starts typing simulation goroutines for all bot
// participants in the room. Must be called with h.mu held, after the race has
// started and the snippet is set.
func (h *Hub) launchBotSimulationsLocked(room *raceRoom) {
	for _, token := range room.Participants {
		session, ok := h.sessions[token]
		if !ok || !session.IsBot {
			continue
		}
		go h.runBotTypingSimulation(room.ID, token, session.BotBaseWPM, session.BotBaseAcc, len(room.Snippet))
	}
}

// runBotTypingSimulation simulates a bot typing through the snippet at its
// assigned WPM and accuracy. It writes progress directly into the session
// under the hub lock. The 100ms state broadcaster picks up changes via
// room.dirty.
func (h *Hub) runBotTypingSimulation(roomID string, sessionToken string, baseWPM float64, baseAccuracy float64, snippetLen int) {
	if snippetLen == 0 || baseWPM <= 0 {
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

	// Characters per second = (WPM * 5) / 60.
	charsPerSecond := (raceWPM * 5.0) / 60.0

	// Error probability per character based on accuracy.
	errorProb := (100.0 - baseAccuracy) / 100.0

	// Interval between progress updates (~300ms for smooth visuals).
	updateInterval := 300 * time.Millisecond

	// Characters to advance per tick.
	charsPerTick := charsPerSecond * updateInterval.Seconds()

	progress := 0
	errorCount := 0
	fractionalProgress := 0.0

	ticker := time.NewTicker(updateInterval)
	defer ticker.Stop()

	for range ticker.C {
		h.mu.Lock()

		room, roomOk := h.rooms[roomID]
		if !roomOk || !room.RaceActive {
			h.mu.Unlock()
			return
		}

		session, sessionOk := h.sessions[sessionToken]
		if !sessionOk || session.FinishedAt != nil {
			h.mu.Unlock()
			return
		}

		// Add jitter to chars per tick (+/- 20%).
		jitter := 0.80 + rand.Float64()*0.40
		fractionalProgress += charsPerTick * jitter

		// Track accumulated fractional progress.
		advance := int(fractionalProgress)
		if advance < 1 {
			h.mu.Unlock()
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

		// Update session state.
		session.Progress = progress
		session.Errors = errorCount

		// Compute WPM and accuracy (mirrors HandleRaceInput logic).
		elapsed := time.Since(room.RaceStartedAt)
		elapsedMinutes := elapsed.Minutes()
		if elapsedMinutes > 0 {
			session.GrossWPM = math.Round((float64(progress)/5.0)/elapsedMinutes*100) / 100
			netChars := float64(progress - errorCount)
			if netChars < 0 {
				netChars = 0
			}
			session.NetWPM = math.Round((netChars/5.0)/elapsedMinutes*100) / 100
		}
		if progress > 0 {
			netChars := float64(progress - errorCount)
			if netChars < 0 {
				netChars = 0
			}
			session.Accuracy = math.Round(netChars/float64(progress)*10000) / 100
		}

		room.dirty = true

		// Check if bot finished.
		if progress >= targetCompletion {
			if progress >= snippetLen {
				finishedAt := time.Now()
				session.FinishedAt = &finishedAt
			}

			// Check if all participants are done.
			allFinished := true
			for _, pToken := range room.Participants {
				pSession, ok := h.sessions[pToken]
				if !ok || pSession.FinishedAt == nil {
					allFinished = false
					break
				}
			}
			if allFinished {
				h.finishRaceForRoomLocked(room, "all_finished")
			}

			h.mu.Unlock()

			if isDNF {
				log.Printf("[bot-sim] %s DNF at %d/%d chars", session.DisplayName, progress, snippetLen)
			}
			return
		}

		h.mu.Unlock()
	}
}

// cleanupBotSessionsLocked removes all bot sessions associated with a room.
// Must be called with h.mu held.
func (h *Hub) cleanupBotSessionsLocked(room *raceRoom) {
	for _, token := range room.Participants {
		session, ok := h.sessions[token]
		if ok && session.IsBot {
			delete(h.sessions, token)
		}
	}
}
