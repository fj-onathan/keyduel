package ws

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log"
	"sort"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

const defaultSnippet = "func race(a int, b int) int {\n\tif a > b {\n\t\treturn a\n\t}\n\treturn b\n}\n"

// newUUID generates a UUID v4 string using crypto/rand.
func newUUID() string {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		// Fallback: should never happen with a working OS
		return fmt.Sprintf("fallback-%d", time.Now().UnixNano())
	}
	b[6] = (b[6] & 0x0f) | 0x40 // version 4
	b[8] = (b[8] & 0x3f) | 0x80 // variant 10
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}

// clientConn bundles a WebSocket connection with a buffered send channel.
// A dedicated write-pump goroutine drains the channel so that broadcasts
// never block the hub mutex on slow clients.
type clientConn struct {
	conn        *websocket.Conn
	send        chan []byte
	authUserID  string // real database user ID from session auth; empty for guests
	displayName string // display name from user profile (empty for guests)
	avatarURL   string // avatar URL from user profile (empty for guests)
}

const (
	// sendBufSize is the per-client outbound message buffer.
	// If a client falls this far behind, it is considered dead and dropped.
	sendBufSize = 64
)

type Hub struct {
	mu              sync.Mutex
	clients         map[string]*clientConn
	clientToSession map[string]string
	sessions        map[string]*playerSession
	queues          map[string][]string
	rooms           map[string]*raceRoom
	nextClientID    uint64
	nextSessionID   uint64
	reconnectGrace  time.Duration
	racePersistence RacePersistence
	snippetProvider SnippetProvider
	redisClient     *redis.Client // optional; used for bot queue-fill notifications
}

type RacePersistence interface {
	PersistRace(ctx context.Context, snapshot RaceSnapshot) error
}

// SnippetProvider selects a snippet for a given language. Implementations may
// query the database or return a fallback.
type SnippetProvider interface {
	RandomSnippet(ctx context.Context, language string) (string, error)
}

type RaceSnapshot struct {
	RaceID       string
	RoomID       string
	Hub          string
	Mode         string
	Snippet      string
	FinishReason string
	StartedAt    time.Time
	EndedAt      time.Time
	Results      []RaceResult
}

type playerSession struct {
	Token          string
	ClientID       string
	AuthUserID     string // real database user ID from session auth; empty for guests
	DisplayName    string // display name from user profile (empty for guests)
	AvatarURL      string // avatar URL from user profile (empty for guests)
	Hub            string
	Mode           string
	Capacity       int
	QueueKey       string
	RoomID         string
	Progress       int
	Errors         int
	GrossWPM       float64
	NetWPM         float64
	Accuracy       float64
	FinishedAt     *time.Time
	DisconnectedAt *time.Time
	ReconnectUntil *time.Time
	LastInputAt    *time.Time
	LastProgress   int
	SuspicionCount int
}

type raceRoom struct {
	ID            string
	RaceID        string
	Hub           string
	Mode          string
	Capacity      int
	Participants  []string
	LeaderToken   string // session token of the room leader
	Snippet       string
	Countdown     int
	Status        string // "waiting", "starting", "active", "finished", "cancelled"
	RaceActive    bool
	RaceStartedAt time.Time
	CreatedAt     time.Time
	FinishedAt    *time.Time
	dirty         bool // true when participant state changed since last broadcast
}

func NewHub() *Hub {
	return &Hub{
		clients:         make(map[string]*clientConn),
		clientToSession: make(map[string]string),
		sessions:        make(map[string]*playerSession),
		queues:          make(map[string][]string),
		rooms:           make(map[string]*raceRoom),
		reconnectGrace:  10 * time.Second,
	}
}

func (h *Hub) SetRacePersistence(persistence RacePersistence) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.racePersistence = persistence
}

func (h *Hub) SetSnippetProvider(provider SnippetProvider) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.snippetProvider = provider
}

// SetRedisClient sets the Redis client used for bot queue-fill notifications.
// When a non-bot user waits in a queue for more than 15 seconds without a match,
// a notification is published to the "bot:queue_fill" channel so the bot runner
// can dispatch a bot to fill the queue.
func (h *Hub) SetRedisClient(client *redis.Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.redisClient = client
}

// PlayerIdentity holds authenticated user identity info resolved during WS upgrade.
type PlayerIdentity struct {
	AuthUserID  string
	DisplayName string
	AvatarURL   string
}

func (h *Hub) Add(conn *websocket.Conn, preferredID string, identity PlayerIdentity) (string, *clientConn) {
	var clientID string
	if preferredID != "" {
		clientID = preferredID
	} else {
		id := atomic.AddUint64(&h.nextClientID, 1)
		clientID = fmt.Sprintf("client-%d", id)
	}

	cc := &clientConn{
		conn:        conn,
		send:        make(chan []byte, sendBufSize),
		authUserID:  identity.AuthUserID,
		displayName: identity.DisplayName,
		avatarURL:   identity.AvatarURL,
	}

	h.mu.Lock()
	// If a client with this ID already exists (e.g., stale connection from
	// a page reload with the same guest ID), close the old send channel so
	// its write pump exits and the old connection is cleaned up.
	if old, exists := h.clients[clientID]; exists {
		close(old.send)
	}
	h.clients[clientID] = cc
	h.mu.Unlock()

	// Start the write pump for this client. It owns all writes to the conn
	// and handles pings. It exits when cc.send is closed (via Remove).
	go h.writePump(clientID, cc)

	return clientID, cc
}

// writePump is the sole writer to a client connection. It drains the send
// channel and periodically sends WebSocket pings. Exiting this function
// means the connection is considered dead.
func (h *Hub) writePump(clientID string, cc *clientConn) {
	ticker := time.NewTicker(pingInterval)
	defer func() {
		ticker.Stop()
		_ = cc.conn.Close()
	}()

	for {
		select {
		case msg, ok := <-cc.send:
			if !ok {
				// Channel closed — connection is being removed.
				_ = cc.conn.SetWriteDeadline(time.Now().Add(writeWait))
				_ = cc.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			_ = cc.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := cc.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				log.Printf("ws write error for %s: %v", clientID, err)
				return
			}
			// Drain any queued messages to coalesce writes and reduce
			// syscall overhead.
			n := len(cc.send)
			for i := 0; i < n; i++ {
				msg, ok = <-cc.send
				if !ok {
					return
				}
				_ = cc.conn.SetWriteDeadline(time.Now().Add(writeWait))
				if err := cc.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
					log.Printf("ws write error for %s: %v", clientID, err)
					return
				}
			}

		case <-ticker.C:
			_ = cc.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := cc.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (h *Hub) Remove(clientID string, expected *clientConn) {
	h.mu.Lock()
	cc := h.clients[clientID]

	// If the connection in the map is not the one we expect, it means
	// Add() already replaced it with a newer connection (e.g., page reload
	// with the same guest ID). In that case, skip cleanup entirely — the
	// new connection owns this clientID now.
	if cc != expected {
		h.mu.Unlock()
		// Still close the old connection if it wasn't closed already.
		if expected != nil {
			select {
			case <-expected.send:
				// already closed
			default:
				close(expected.send)
			}
		}
		return
	}

	delete(h.clients, clientID)

	token := h.clientToSession[clientID]
	delete(h.clientToSession, clientID)

	if token != "" {
		if session, ok := h.sessions[token]; ok {
			now := time.Now()
			session.ClientID = ""
			session.DisconnectedAt = &now
			reconnectUntil := now.Add(h.reconnectGrace)
			session.ReconnectUntil = &reconnectUntil

			if session.QueueKey != "" {
				h.removeTokenFromQueueLocked(session.QueueKey, token)
				session.QueueKey = ""
			}

			if session.RoomID != "" {
				if room, ok := h.rooms[session.RoomID]; ok {
					h.broadcastRoomLocked(room, ServerEvent{
						Type:     "presence_update",
						RoomID:   room.ID,
						ClientID: clientID,
						Message:  "player disconnected",
					})

					// Reassign leader if the disconnected player was the leader
					if room.LeaderToken == token {
						h.reassignLeaderLocked(room)
					}
				}
			}
		}
	}
	h.mu.Unlock()

	// Close the send channel to signal the write pump to exit. The write
	// pump will close the underlying connection on its way out.
	if cc != nil {
		close(cc.send)
	}
}

func (h *Hub) Count() int {
	h.mu.Lock()
	defer h.mu.Unlock()
	return len(h.clients)
}

func (h *Hub) Broadcast(event ServerEvent) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.broadcastLocked(event)
}

func (h *Hub) Send(clientID string, event ServerEvent) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.sendLocked(clientID, event)
}

func (h *Hub) HandleQueueRace(clientID string, hubName string, mode string, capacity int, reconnectToken string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	hubName = normalizeHub(hubName)
	mode = normalizeMode(mode)
	capacity = normalizeCapacity(capacity)

	session, _ := h.resolveSessionLocked(clientID, reconnectToken)
	if session == nil {
		h.sendLocked(clientID, ServerEvent{Type: "error", Message: "unable to create session"})
		return
	}

	session.Hub = hubName
	session.Mode = mode
	session.Capacity = capacity

	h.sendLocked(clientID, ServerEvent{
		Type:         "session_assigned",
		ClientID:     clientID,
		Connected:    len(h.clients),
		SessionToken: session.Token,
		Message:      "session ready",
	})

	// If session is already in a room (whether from a true reconnect or
	// from a connection replacement via stable guest ID), re-send the
	// room state instead of re-queuing.
	if session.RoomID != "" {
		if room, ok := h.rooms[session.RoomID]; ok {
			if room.Status == "waiting" {
				h.sendLocked(clientID, ServerEvent{
					Type:       "room_assigned",
					RoomID:     room.ID,
					RaceID:     room.RaceID,
					SnippetLen: len(room.Snippet),
					Message:    "rejoined race",
					LeaderID:   h.leaderClientIDLocked(room),
				})
			} else {
				h.sendLocked(clientID, ServerEvent{
					Type:         "race_resumed",
					RoomID:       room.ID,
					RaceID:       room.RaceID,
					Snippet:      room.Snippet,
					SnippetLen:   len(room.Snippet),
					Countdown:    room.Countdown,
					Participants: h.snapshotParticipantsForRoomLocked(room),
					Message:      roomStatusMessage(room),
					LeaderID:     h.leaderClientIDLocked(room),
					YourProgress: session.Progress,
				})
			}
			return
		}
		session.RoomID = ""
	}

	if session.QueueKey != "" {
		h.sendLocked(clientID, ServerEvent{
			Type:      "queued",
			ClientID:  clientID,
			Connected: len(h.clients),
			QueueKey:  session.QueueKey,
			Message:   "already in queue",
		})
		return
	}

	queueKey := queueKeyFor(hubName, mode, capacity)
	session.QueueKey = queueKey
	h.queues[queueKey] = append(h.queues[queueKey], session.Token)

	position := h.queuePositionLocked(queueKey, session.Token)
	h.sendLocked(clientID, ServerEvent{
		Type:      "queued",
		ClientID:  clientID,
		Connected: len(h.clients),
		QueueKey:  queueKey,
		Position:  position,
		Message:   "queued for matchmaking",
	})

	h.tryMatchLocked(queueKey)

	// If the user is still queued (not matched) and is a non-bot user,
	// schedule a queue-fill notification so the bot runner can dispatch
	// a bot to match with them. This prevents real users from waiting
	// indefinitely in an empty queue.
	if session.QueueKey != "" && h.redisClient != nil && !isBotUser(session) {
		sessionToken := session.Token
		go h.scheduleQueueFillNotification(sessionToken, hubName, 15*time.Second)
	}
}

func (h *Hub) HandleJoinRoom(clientID string) {
	h.HandleQueueRace(clientID, "go", "sprint", 2, "")
}

// FindOrCreateWaitingRoom finds an existing waiting room for the given hub or
// creates a new empty one. Returns the raceID and roomID. This is safe to call
// from HTTP handlers (it acquires the hub lock internally).
func (h *Hub) FindOrCreateWaitingRoom(hubName string, mode string, capacity int) (raceID string, roomID string) {
	hubName = normalizeHub(hubName)
	mode = normalizeMode(mode)
	capacity = normalizeCapacity(capacity)

	h.mu.Lock()
	defer h.mu.Unlock()

	// Look for an existing room for this hub that hasn't started yet
	for _, room := range h.rooms {
		if room.Hub != hubName || room.Mode != mode {
			continue
		}
		if room.Status != "waiting" {
			continue
		}
		if room.RaceActive || room.FinishedAt != nil {
			continue
		}
		if len(room.Participants) >= room.Capacity {
			continue
		}
		return room.RaceID, room.ID
	}

	// No waiting room found — create one
	newRoomID := newUUID()
	newRaceID := newUUID()

	room := &raceRoom{
		ID:           newRoomID,
		RaceID:       newRaceID,
		Hub:          hubName,
		Mode:         mode,
		Capacity:     capacity,
		Participants: []string{},
		Snippet:      "", // snippet is selected when the leader starts the race
		Countdown:    3,
		Status:       "waiting",
		CreatedAt:    time.Now(),
	}
	h.rooms[newRoomID] = room

	return newRaceID, newRoomID
}

// HandleJoinRace lets a connected client join a specific room by raceID.
func (h *Hub) HandleJoinRace(clientID string, raceID string, reconnectToken string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	// Find the room by raceID
	var targetRoom *raceRoom
	for _, room := range h.rooms {
		if room.RaceID == raceID {
			targetRoom = room
			break
		}
	}

	if targetRoom == nil {
		h.sendLocked(clientID, ServerEvent{
			Type:    "error",
			Message: "race not found",
		})
		return
	}

	// Try to resolve an existing session first (before status checks)
	// so we can allow reconnection to active/starting races.
	if reconnectToken != "" {
		session, resumed := h.resolveSessionLocked(clientID, reconnectToken)
		if session != nil && session.RoomID == targetRoom.ID {
			// This is a reconnecting participant (either after a true
			// disconnect, or after a connection replacement via stable
			// guest ID where Remove was skipped). Allow regardless of
			// room status.
			_ = resumed // both resumed=true and resumed=false are valid here

			// If the room has no leader (e.g., Remove cleared it during
			// the reconnect grace window), reassign now that a connected
			// participant is back.
			if targetRoom.LeaderToken == "" {
				h.reassignLeaderLocked(targetRoom)
			}

			h.sendLocked(clientID, ServerEvent{
				Type:         "session_assigned",
				ClientID:     clientID,
				Connected:    len(h.clients),
				SessionToken: session.Token,
				Message:      "session ready",
			})

			if targetRoom.Status == "waiting" {
				// Room hasn't started yet — send room_assigned so frontend
				// shows "Waiting for leader to start..." instead of countdown.
				h.sendLocked(clientID, ServerEvent{
					Type:       "room_assigned",
					RoomID:     targetRoom.ID,
					RaceID:     targetRoom.RaceID,
					SnippetLen: len(targetRoom.Snippet),
					Message:    "rejoined race",
					LeaderID:   h.leaderClientIDLocked(targetRoom),
				})
			} else {
				// Room is starting/active/finished — send full race state.
				h.sendLocked(clientID, ServerEvent{
					Type:         "race_resumed",
					RoomID:       targetRoom.ID,
					RaceID:       targetRoom.RaceID,
					Snippet:      targetRoom.Snippet,
					SnippetLen:   len(targetRoom.Snippet),
					Countdown:    targetRoom.Countdown,
					Participants: h.snapshotParticipantsForRoomLocked(targetRoom),
					Message:      roomStatusMessage(targetRoom),
					LeaderID:     h.leaderClientIDLocked(targetRoom),
					YourProgress: session.Progress,
				})
			}

			// Notify others of the reconnection
			h.broadcastRoomLocked(targetRoom, ServerEvent{
				Type:         "presence_update",
				RoomID:       targetRoom.ID,
				RaceID:       targetRoom.RaceID,
				Participants: h.snapshotParticipantsForRoomLocked(targetRoom),
				LeaderID:     h.leaderClientIDLocked(targetRoom),
			})
			return
		}
	}

	if targetRoom.RaceActive {
		h.sendLocked(clientID, ServerEvent{
			Type:    "error",
			Message: "race already in progress",
		})
		return
	}

	if targetRoom.FinishedAt != nil {
		h.sendLocked(clientID, ServerEvent{
			Type:    "error",
			Message: "race already finished",
		})
		return
	}

	// Resolve or create session
	session, _ := h.resolveSessionLocked(clientID, reconnectToken)
	if session == nil {
		h.sendLocked(clientID, ServerEvent{Type: "error", Message: "unable to create session"})
		return
	}

	session.Hub = targetRoom.Hub
	session.Mode = targetRoom.Mode
	session.Capacity = targetRoom.Capacity

	h.sendLocked(clientID, ServerEvent{
		Type:         "session_assigned",
		ClientID:     clientID,
		Connected:    len(h.clients),
		SessionToken: session.Token,
		Message:      "session ready",
	})

	// If resumed and already in this room, just re-send room state
	if session.RoomID == targetRoom.ID {
		// If the room has no leader (e.g., Remove cleared it during
		// the reconnect grace window), reassign now.
		if targetRoom.LeaderToken == "" {
			h.reassignLeaderLocked(targetRoom)
		}
		if targetRoom.Status == "waiting" {
			h.sendLocked(clientID, ServerEvent{
				Type:       "room_assigned",
				RoomID:     targetRoom.ID,
				RaceID:     targetRoom.RaceID,
				SnippetLen: len(targetRoom.Snippet),
				Message:    "rejoined race",
				LeaderID:   h.leaderClientIDLocked(targetRoom),
			})
		} else {
			h.sendLocked(clientID, ServerEvent{
				Type:         "race_resumed",
				RoomID:       targetRoom.ID,
				RaceID:       targetRoom.RaceID,
				Snippet:      targetRoom.Snippet,
				SnippetLen:   len(targetRoom.Snippet),
				Countdown:    targetRoom.Countdown,
				Participants: h.snapshotParticipantsForRoomLocked(targetRoom),
				Message:      roomStatusMessage(targetRoom),
				LeaderID:     h.leaderClientIDLocked(targetRoom),
				YourProgress: session.Progress,
			})
		}
		return
	}

	// Remove from any existing queue
	if session.QueueKey != "" {
		h.removeTokenFromQueueLocked(session.QueueKey, session.Token)
		session.QueueKey = ""
	}

	// Check capacity (count only active participants — skip disconnected ones)
	activeCount := 0
	for _, token := range targetRoom.Participants {
		if s, ok := h.sessions[token]; ok && s.ClientID != "" {
			activeCount++
		}
	}
	if activeCount >= targetRoom.Capacity {
		h.sendLocked(clientID, ServerEvent{
			Type:    "error",
			Message: "race is full",
		})
		return
	}

	// Add to room (guard against duplicate entries)
	session.QueueKey = ""
	session.RoomID = targetRoom.ID
	session.Progress = 0
	session.Errors = 0
	session.GrossWPM = 0
	session.NetWPM = 0
	session.Accuracy = 100
	session.FinishedAt = nil
	session.LastInputAt = nil
	session.LastProgress = 0
	session.SuspicionCount = 0
	session.LastInputAt = nil
	session.LastProgress = 0
	session.SuspicionCount = 0

	alreadyInRoom := false
	for _, t := range targetRoom.Participants {
		if t == session.Token {
			alreadyInRoom = true
			break
		}
	}
	if !alreadyInRoom {
		targetRoom.Participants = append(targetRoom.Participants, session.Token)
	}

	// Assign leader if room has no leader yet
	if targetRoom.LeaderToken == "" {
		targetRoom.LeaderToken = session.Token
	}

	h.sendToSessionLocked(session, ServerEvent{
		Type:       "room_assigned",
		RoomID:     targetRoom.ID,
		RaceID:     targetRoom.RaceID,
		SnippetLen: len(targetRoom.Snippet),
		Message:    "joined race",
		LeaderID:   h.leaderClientIDLocked(targetRoom),
	})

	// Notify other participants (include leader info)
	leaderClientID := h.leaderClientIDLocked(targetRoom)
	h.broadcastRoomLocked(targetRoom, ServerEvent{
		Type:         "presence_update",
		RoomID:       targetRoom.ID,
		ClientID:     clientID,
		Connected:    len(targetRoom.Participants),
		Participants: h.snapshotParticipantsForRoomLocked(targetRoom),
		Message:      "player joined",
		LeaderID:     leaderClientID,
	})
}

func (h *Hub) HandleLeaveQueue(clientID string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	token := h.clientToSession[clientID]
	if token == "" {
		return
	}

	session, ok := h.sessions[token]
	if !ok || session.QueueKey == "" {
		return
	}

	queueKey := session.QueueKey
	h.removeTokenFromQueueLocked(queueKey, token)
	session.QueueKey = ""

	h.sendLocked(clientID, ServerEvent{
		Type:      "queue_left",
		QueueKey:  queueKey,
		Connected: len(h.clients),
		Message:   "left queue",
	})
}

func (h *Hub) HandleLeaveRoom(clientID string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	token := h.clientToSession[clientID]
	if token == "" {
		h.sendLocked(clientID, ServerEvent{Type: "error", Message: "session not found"})
		return
	}

	session, ok := h.sessions[token]
	if !ok {
		h.sendLocked(clientID, ServerEvent{Type: "error", Message: "session not found"})
		return
	}

	// If still in a queue, leave it too
	if session.QueueKey != "" {
		h.removeTokenFromQueueLocked(session.QueueKey, token)
		session.QueueKey = ""
	}

	if session.RoomID == "" {
		h.sendLocked(clientID, ServerEvent{Type: "room_left", Message: "not in a room"})
		return
	}

	room, ok := h.rooms[session.RoomID]
	if !ok {
		// Room already gone — just clear session state
		session.RoomID = ""
		h.sendLocked(clientID, ServerEvent{Type: "room_left", Message: "left room"})
		return
	}

	// Remove participant from room
	room.Participants = removeString(room.Participants, token)
	session.RoomID = ""

	if room.RaceActive {
		room.dirty = true
	}

	// Reassign leader if needed
	wasLeader := room.LeaderToken == token
	if wasLeader {
		h.reassignLeaderLocked(room)
	}

	// If race is active and fewer than 2 participants remain, finish it
	if room.RaceActive && len(room.Participants) < 2 {
		h.finishRaceForRoomLocked(room, "insufficient_players")
	}

	// Clean up empty rooms
	if len(room.Participants) == 0 {
		delete(h.rooms, room.ID)
	} else {
		// Notify remaining participants
		h.broadcastRoomLocked(room, ServerEvent{
			Type:         "presence_update",
			RoomID:       room.ID,
			RaceID:       room.RaceID,
			Participants: h.snapshotParticipantsForRoomLocked(room),
			LeaderID:     h.leaderClientIDLocked(room),
			Message:      "player left",
		})
	}

	// Confirm to the leaving client
	h.sendLocked(clientID, ServerEvent{Type: "room_left", Message: "left room"})
}

// HandleStartRace lets the room leader start the race. It selects a snippet
// (from the provider or falls back to a default) and begins the countdown.
func (h *Hub) HandleStartRace(clientID string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	token := h.clientToSession[clientID]
	if token == "" {
		h.sendLocked(clientID, ServerEvent{Type: "error", Message: "session not found"})
		return
	}

	session, ok := h.sessions[token]
	if !ok || session.RoomID == "" {
		h.sendLocked(clientID, ServerEvent{Type: "error", Message: "not in a room"})
		return
	}

	room, ok := h.rooms[session.RoomID]
	if !ok {
		h.sendLocked(clientID, ServerEvent{Type: "error", Message: "room not found"})
		return
	}

	if room.RaceActive || room.FinishedAt != nil {
		h.sendLocked(clientID, ServerEvent{Type: "error", Message: "race already started or finished"})
		return
	}

	if room.LeaderToken != token {
		h.sendLocked(clientID, ServerEvent{Type: "error", Message: "only the leader can start the race"})
		return
	}

	// Select a snippet for the hub's language
	snippet := defaultSnippet
	if h.snippetProvider != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()
		selected, err := h.snippetProvider.RandomSnippet(ctx, room.Hub)
		if err != nil {
			log.Printf("snippet provider failed for hub %q: %v (using default)", room.Hub, err)
		} else if selected != "" {
			snippet = selected
		}
	}

	room.Snippet = snippet
	h.startRoomCountdownLocked(room)
}

func (h *Hub) HandleHeartbeat(clientID string, reconnectToken string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if reconnectToken == "" {
		h.sendLocked(clientID, ServerEvent{Type: "heartbeat_ack"})
		return
	}

	session, resumed := h.resolveSessionLocked(clientID, reconnectToken)
	if session == nil {
		h.sendLocked(clientID, ServerEvent{Type: "error", Message: "reconnect token invalid"})
		return
	}

	h.sendLocked(clientID, ServerEvent{
		Type:         "heartbeat_ack",
		SessionToken: session.Token,
		Message:      boolMessage(resumed, "session resumed", "session active"),
	})
}

func (h *Hub) HandleRaceInput(clientID string, progress int, errors int) {
	h.mu.Lock()
	defer h.mu.Unlock()

	token := h.clientToSession[clientID]
	if token == "" {
		h.sendLocked(clientID, ServerEvent{Type: "error", Message: "session not found"})
		return
	}

	session, ok := h.sessions[token]
	if !ok || session.RoomID == "" {
		h.sendLocked(clientID, ServerEvent{Type: "error", Message: "join queue first"})
		return
	}

	room, ok := h.rooms[session.RoomID]
	if !ok || !room.RaceActive {
		return
	}

	now := time.Now()
	if session.LastInputAt != nil {
		delta := now.Sub(*session.LastInputAt)
		if delta < 16*time.Millisecond && progress > session.LastProgress+1 {
			session.SuspicionCount++
			h.sendLocked(clientID, ServerEvent{Type: "error", Message: "input rate too fast"})
			return
		}

		if delta > 0 {
			allowedForward := int(delta.Seconds()*25) + 3
			forwardJump := progress - session.LastProgress
			if forwardJump > allowedForward {
				session.SuspicionCount++
				h.sendLocked(clientID, ServerEvent{Type: "error", Message: "invalid progression jump"})
				return
			}

			if session.LastProgress-progress > 12 {
				session.SuspicionCount++
				h.sendLocked(clientID, ServerEvent{Type: "error", Message: "invalid backward jump"})
				return
			}
		}
	}

	if progress < 0 {
		progress = 0
	}
	if progress > len(room.Snippet) {
		progress = len(room.Snippet)
	}
	if errors < 0 {
		errors = 0
	}

	session.Progress = progress
	session.Errors = errors

	room.dirty = true

	elapsed := time.Since(room.RaceStartedAt)
	if elapsed <= 0 {
		elapsed = time.Second
	}
	elapsedMinutes := elapsed.Minutes()
	grossWPM := (float64(progress) / 5.0) / elapsedMinutes
	netChars := progress - errors
	if netChars < 0 {
		netChars = 0
	}
	netWPM := (float64(netChars) / 5.0) / elapsedMinutes
	session.GrossWPM = grossWPM
	session.NetWPM = netWPM

	if progress == 0 {
		session.Accuracy = 100
	} else {
		session.Accuracy = (float64(netChars) / float64(progress)) * 100
	}

	session.LastProgress = progress
	session.LastInputAt = &now

	if progress >= len(room.Snippet) && session.FinishedAt == nil {
		finishedAt := time.Now()
		session.FinishedAt = &finishedAt
	}

	allFinished := true
	for _, participantToken := range room.Participants {
		participantSession, ok := h.sessions[participantToken]
		if !ok || participantSession.FinishedAt == nil {
			allFinished = false
			break
		}
	}

	if allFinished {
		h.finishRaceForRoomLocked(room, "all_finished")
	}
}

func (h *Hub) StartRoomStateBroadcast(interval time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		for range ticker.C {
			h.mu.Lock()
			for _, room := range h.rooms {
				if !room.RaceActive || !room.dirty {
					continue
				}
				room.dirty = false
				h.broadcastRoomLocked(room, ServerEvent{
					Type:         "race_state_update",
					RoomID:       room.ID,
					RaceID:       room.RaceID,
					Participants: h.snapshotParticipantsForRoomLocked(room),
				})
			}
			h.mu.Unlock()
		}
	}()
}

func (h *Hub) StartCleanupSweep(interval time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		for range ticker.C {
			h.mu.Lock()
			now := time.Now()

			for token, session := range h.sessions {
				if session.ClientID != "" || session.ReconnectUntil == nil || now.Before(*session.ReconnectUntil) {
					continue
				}

				if session.QueueKey != "" {
					h.removeTokenFromQueueLocked(session.QueueKey, token)
					session.QueueKey = ""
				}

				if session.RoomID != "" {
					if room, ok := h.rooms[session.RoomID]; ok {
						room.Participants = removeString(room.Participants, token)
						if room.RaceActive {
							room.dirty = true
						}
						// Reassign leader if the removed session was the leader
						if room.LeaderToken == token {
							h.reassignLeaderLocked(room)
						}
						if room.RaceActive && len(room.Participants) < 2 {
							h.finishRaceForRoomLocked(room, "insufficient_players")
						}
						if len(room.Participants) == 0 {
							delete(h.rooms, room.ID)
						}
					}
				}

				delete(h.sessions, token)
			}

			for roomID, room := range h.rooms {
				if room.RaceActive || room.Countdown > 0 {
					continue
				}
				if room.FinishedAt != nil && now.Sub(*room.FinishedAt) > 15*time.Second {
					delete(h.rooms, roomID)
				}
			}

			h.mu.Unlock()
		}
	}()
}

// StartOnlineCountPublisher periodically writes the current online player
// count to a Redis key so the API server can include it in SSE streams.
func (h *Hub) StartOnlineCountPublisher(redisClient *redis.Client, interval time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		for range ticker.C {
			count := h.Count()
			ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
			_ = redisClient.Set(ctx, "platform:online_players", count, 30*time.Second).Err()
			cancel()
		}
	}()
}

// scheduleQueueFillNotification waits for the given delay and then checks if
// the session is still queued. If so, it publishes a notification to the
// "bot:queue_fill" Redis channel so the bot runner can dispatch a bot.
func (h *Hub) scheduleQueueFillNotification(sessionToken string, hub string, delay time.Duration) {
	time.Sleep(delay)

	h.mu.Lock()
	session, ok := h.sessions[sessionToken]
	stillQueued := ok && session.QueueKey != ""
	h.mu.Unlock()

	if !stillQueued {
		return // User was matched or left queue before the delay elapsed.
	}

	if h.redisClient == nil {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := h.redisClient.Publish(ctx, "bot:queue_fill", hub).Err(); err != nil {
		log.Printf("failed to publish queue-fill notification for hub %s: %v", hub, err)
	} else {
		log.Printf("published queue-fill notification for hub %s", hub)
	}
}

// isBotUser checks if the session belongs to a bot user based on the
// connection's guest ID pattern. Bot users connect with usernames that
// match their @bot.race.local email prefix.
func isBotUser(session *playerSession) bool {
	// Bot users don't have an AuthUserID (they connect as guests).
	// However, the key distinguisher is that their client ID matches
	// their bot username. Since we can't easily check the email here,
	// we check the AuthUserID — bot players connect without auth,
	// so AuthUserID is empty. But regular guest users also have empty
	// AuthUserID. To avoid false positives, we only trigger queue-fill
	// for authenticated users (who have a real AuthUserID).
	// This is a reasonable heuristic: bots are always unauthenticated
	// guests, while real users worth filling queues for are authenticated.
	return session.AuthUserID == ""
}

func (h *Hub) resolveSessionLocked(clientID string, reconnectToken string) (*playerSession, bool) {
	// Resolve the auth user identity from the active connection, if any.
	var authUserID, displayName, avatarURL string
	if cc, ok := h.clients[clientID]; ok {
		authUserID = cc.authUserID
		displayName = cc.displayName
		avatarURL = cc.avatarURL
	}

	if reconnectToken != "" {
		if existing, ok := h.sessions[reconnectToken]; ok {
			if existing.ClientID == "" && existing.ReconnectUntil != nil && time.Now().Before(*existing.ReconnectUntil) {
				existing.ClientID = clientID
				existing.DisconnectedAt = nil
				existing.ReconnectUntil = nil
				if authUserID != "" {
					existing.AuthUserID = authUserID
					existing.DisplayName = displayName
					existing.AvatarURL = avatarURL
				}
				h.clientToSession[clientID] = existing.Token
				return existing, true
			}
			if existing.ClientID == clientID {
				if authUserID != "" {
					existing.AuthUserID = authUserID
					existing.DisplayName = displayName
					existing.AvatarURL = avatarURL
				}
				return existing, false
			}
		}
	}

	token := h.clientToSession[clientID]
	if token != "" {
		if existing, ok := h.sessions[token]; ok {
			if authUserID != "" {
				existing.AuthUserID = authUserID
				existing.DisplayName = displayName
				existing.AvatarURL = avatarURL
			}
			return existing, false
		}
	}

	token = fmt.Sprintf("session-%d", atomic.AddUint64(&h.nextSessionID, 1))
	session := &playerSession{
		Token:       token,
		ClientID:    clientID,
		AuthUserID:  authUserID,
		DisplayName: displayName,
		AvatarURL:   avatarURL,
		Capacity:    2,
	}
	h.sessions[token] = session
	h.clientToSession[clientID] = token
	return session, false
}

func (h *Hub) tryMatchLocked(queueKey string) {
	for {
		queue := h.queues[queueKey]
		if len(queue) < 2 {
			return
		}

		capacity := parseQueueCapacity(queueKey)
		selected := make([]string, 0, capacity)
		for _, token := range queue {
			session, ok := h.sessions[token]
			if !ok || session.ClientID == "" {
				continue
			}
			selected = append(selected, token)
			if len(selected) == capacity {
				break
			}
		}

		if len(selected) < 2 {
			return
		}

		selectedSet := make(map[string]struct{}, len(selected))
		for _, token := range selected {
			selectedSet[token] = struct{}{}
		}

		newQueue := make([]string, 0, len(queue)-len(selected))
		for _, token := range queue {
			if _, ok := selectedSet[token]; ok {
				continue
			}
			newQueue = append(newQueue, token)
		}
		h.queues[queueKey] = newQueue

		room := h.createRoomLocked(queueKey, selected)
		h.startRoomCountdownLocked(room)
	}
}

func (h *Hub) createRoomLocked(queueKey string, participantTokens []string) *raceRoom {
	parts := strings.Split(queueKey, "|")
	hubName := "go"
	mode := "sprint"
	capacity := 2
	if len(parts) == 3 {
		hubName = parts[0]
		mode = parts[1]
		capacity = parseIntOrDefault(parts[2], 2)
	}

	roomID := newUUID()
	raceID := newUUID()

	// Select a snippet for the hub's language (same logic as HandleStartRace).
	snippet := defaultSnippet
	if h.snippetProvider != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()
		selected, err := h.snippetProvider.RandomSnippet(ctx, hubName)
		if err != nil {
			log.Printf("snippet provider failed for hub %q: %v (using default)", hubName, err)
		} else if selected != "" {
			snippet = selected
		}
	}

	room := &raceRoom{
		ID:           roomID,
		RaceID:       raceID,
		Hub:          hubName,
		Mode:         mode,
		Capacity:     capacity,
		Participants: append([]string(nil), participantTokens...),
		Snippet:      snippet,
		Countdown:    3,
		CreatedAt:    time.Now(),
	}
	h.rooms[roomID] = room

	for _, token := range participantTokens {
		session, ok := h.sessions[token]
		if !ok {
			continue
		}
		session.QueueKey = ""
		session.RoomID = roomID
		session.Progress = 0
		session.Errors = 0
		session.GrossWPM = 0
		session.NetWPM = 0
		session.Accuracy = 100
		session.FinishedAt = nil

		h.sendToSessionLocked(session, ServerEvent{
			Type:       "room_assigned",
			RoomID:     roomID,
			RaceID:     raceID,
			SnippetLen: len(room.Snippet),
			Message:    "match found",
		})
	}

	return room
}

func (h *Hub) startRoomCountdownLocked(room *raceRoom) {
	room.Countdown = 3
	room.Status = "starting"
	go h.runRoomCountdown(room.ID)
}

func (h *Hub) runRoomCountdown(roomID string) {
	for countdown := 3; countdown > 0; countdown-- {
		h.mu.Lock()
		room, ok := h.rooms[roomID]
		if !ok || room.RaceActive || room.FinishedAt != nil {
			h.mu.Unlock()
			return
		}
		room.Countdown = countdown
		// Do NOT send snippet during countdown to prevent early reading.
		h.broadcastRoomLocked(room, ServerEvent{
			Type:       "race_countdown",
			RoomID:     room.ID,
			RaceID:     room.RaceID,
			Countdown:  countdown,
			SnippetLen: len(room.Snippet),
		})
		h.mu.Unlock()
		time.Sleep(time.Second)
	}

	h.mu.Lock()
	room, ok := h.rooms[roomID]
	if !ok || room.FinishedAt != nil {
		h.mu.Unlock()
		return
	}

	if h.connectedParticipantsForRoomLocked(room) < 1 {
		now := time.Now()
		room.FinishedAt = &now
		room.Status = "cancelled"
		h.broadcastRoomLocked(room, ServerEvent{
			Type:    "race_cancelled",
			RoomID:  room.ID,
			RaceID:  room.RaceID,
			Message: "not enough connected players",
		})
		h.mu.Unlock()
		return
	}

	room.Countdown = 0
	room.RaceActive = true
	room.Status = "active"
	room.RaceStartedAt = time.Now()
	room.dirty = true

	for _, token := range room.Participants {
		session, ok := h.sessions[token]
		if !ok {
			continue
		}
		session.Progress = 0
		session.Errors = 0
		session.GrossWPM = 0
		session.NetWPM = 0
		session.Accuracy = 100
		session.FinishedAt = nil
	}

	h.broadcastRoomLocked(room, ServerEvent{
		Type:         "race_started",
		RoomID:       room.ID,
		RaceID:       room.RaceID,
		Snippet:      room.Snippet,
		SnippetLen:   len(room.Snippet),
		Participants: h.snapshotParticipantsForRoomLocked(room),
	})
	h.mu.Unlock()

	go h.raceTimeout(roomID, 90*time.Second)
}

func (h *Hub) raceTimeout(roomID string, timeout time.Duration) {
	timer := time.NewTimer(timeout)
	defer timer.Stop()
	<-timer.C

	h.mu.Lock()
	defer h.mu.Unlock()

	room, ok := h.rooms[roomID]
	if !ok || !room.RaceActive {
		return
	}
	h.finishRaceForRoomLocked(room, "timeout")
}

func (h *Hub) finishRaceForRoomLocked(room *raceRoom, reason string) {
	if !room.RaceActive {
		if room.FinishedAt == nil {
			now := time.Now()
			room.FinishedAt = &now
			room.Status = "finished"
		}
		return
	}

	results := h.resultsForRoomLocked(room)
	durationMs := time.Since(room.RaceStartedAt).Milliseconds()
	startedAt := room.RaceStartedAt

	room.RaceActive = false
	room.Status = "finished"
	now := time.Now()
	room.FinishedAt = &now
	endedAt := now

	if h.racePersistence != nil {
		snapshot := RaceSnapshot{
			RaceID:       room.RaceID,
			RoomID:       room.ID,
			Hub:          room.Hub,
			Mode:         room.Mode,
			Snippet:      room.Snippet,
			FinishReason: reason,
			StartedAt:    startedAt,
			EndedAt:      endedAt,
			Results:      append([]RaceResult(nil), results...),
		}
		log.Printf("[persist] scheduling race persistence for %s (hub=%s, reason=%s, participants=%d)", snapshot.RaceID, snapshot.Hub, reason, len(snapshot.Results))
		go func() {
			ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
			defer cancel()
			if err := h.racePersistence.PersistRace(ctx, snapshot); err != nil {
				log.Printf("[persist] race persistence FAILED for %s: %v", snapshot.RaceID, err)
			} else {
				log.Printf("[persist] race persistence OK for %s", snapshot.RaceID)
			}
		}()
	} else {
		log.Printf("[persist] WARNING: racePersistence is nil, skipping persistence for race %s", room.RaceID)
	}

	h.broadcastRoomLocked(room, ServerEvent{
		Type:       "race_finished",
		RoomID:     room.ID,
		RaceID:     room.RaceID,
		Message:    reason,
		DurationMS: durationMs,
		Results:    results,
	})
}

func (h *Hub) resultsForRoomLocked(room *raceRoom) []RaceResult {
	results := make([]RaceResult, 0, len(room.Participants))
	for _, token := range room.Participants {
		session, ok := h.sessions[token]
		if !ok {
			continue
		}

		completion := 0.0
		if len(room.Snippet) > 0 {
			completion = float64(session.Progress) / float64(len(room.Snippet)) * 100
		}
		result := RaceResult{
			ClientID:          session.ClientID,
			AuthUserID:        session.AuthUserID,
			DisplayName:       session.DisplayName,
			AvatarURL:         session.AvatarURL,
			CompletionPercent: completion,
			Progress:          session.Progress,
			GrossWPM:          session.GrossWPM,
			NetWPM:            session.NetWPM,
			Accuracy:          session.Accuracy,
			Errors:            session.Errors,
			Finished:          session.FinishedAt != nil,
			Suspicious:        session.SuspicionCount > 0,
		}
		if session.FinishedAt != nil {
			result.FinishedElapsedMS = session.FinishedAt.Sub(room.RaceStartedAt).Milliseconds()
		}
		results = append(results, result)
	}

	sort.Slice(results, func(i int, j int) bool {
		a := results[i]
		b := results[j]
		if a.CompletionPercent != b.CompletionPercent {
			return a.CompletionPercent > b.CompletionPercent
		}
		if a.Finished != b.Finished {
			return a.Finished
		}
		if a.Finished && b.Finished && a.FinishedElapsedMS != b.FinishedElapsedMS {
			return a.FinishedElapsedMS < b.FinishedElapsedMS
		}
		if a.NetWPM != b.NetWPM {
			return a.NetWPM > b.NetWPM
		}
		return a.Accuracy > b.Accuracy
	})

	for i := range results {
		results[i].Position = i + 1
	}

	return results
}

func (h *Hub) connectedParticipantsForRoomLocked(room *raceRoom) int {
	count := 0
	for _, token := range room.Participants {
		session, ok := h.sessions[token]
		if !ok || session.ClientID == "" {
			continue
		}
		count++
	}
	return count
}

func (h *Hub) leaderClientIDLocked(room *raceRoom) string {
	if room.LeaderToken == "" {
		return ""
	}
	if session, ok := h.sessions[room.LeaderToken]; ok && session.ClientID != "" {
		return session.ClientID
	}
	return ""
}

// reassignLeaderLocked picks the next connected participant as leader. If no
// connected participants remain, LeaderToken is cleared.
func (h *Hub) reassignLeaderLocked(room *raceRoom) {
	room.LeaderToken = ""
	for _, token := range room.Participants {
		session, ok := h.sessions[token]
		if !ok || session.ClientID == "" {
			continue
		}
		room.LeaderToken = token
		break
	}

	leaderClientID := h.leaderClientIDLocked(room)
	h.broadcastRoomLocked(room, ServerEvent{
		Type:     "leader_changed",
		RoomID:   room.ID,
		LeaderID: leaderClientID,
		Message:  "new leader assigned",
	})
}

func (h *Hub) snapshotParticipantsForRoomLocked(room *raceRoom) []ParticipantSnapshot {
	snapshot := make([]ParticipantSnapshot, 0, len(room.Participants))
	for _, token := range room.Participants {
		session, ok := h.sessions[token]
		if !ok {
			continue
		}
		id := session.ClientID
		if id == "" {
			id = token
		}
		snapshot = append(snapshot, ParticipantSnapshot{
			ClientID:    id,
			DisplayName: session.DisplayName,
			AvatarURL:   session.AvatarURL,
			Progress:    session.Progress,
			Errors:      session.Errors,
			GrossWPM:    session.GrossWPM,
			NetWPM:      session.NetWPM,
			Accuracy:    session.Accuracy,
			Finished:    session.FinishedAt != nil,
		})
	}

	sort.Slice(snapshot, func(i int, j int) bool {
		if snapshot[i].Progress != snapshot[j].Progress {
			return snapshot[i].Progress > snapshot[j].Progress
		}
		if snapshot[i].NetWPM != snapshot[j].NetWPM {
			return snapshot[i].NetWPM > snapshot[j].NetWPM
		}
		return snapshot[i].Accuracy > snapshot[j].Accuracy
	})

	return snapshot
}

func (h *Hub) queuePositionLocked(queueKey string, token string) int {
	queue := h.queues[queueKey]
	for i, item := range queue {
		if item == token {
			return i + 1
		}
	}
	return 0
}

func (h *Hub) removeTokenFromQueueLocked(queueKey string, token string) {
	queue := h.queues[queueKey]
	if len(queue) == 0 {
		return
	}

	updated := make([]string, 0, len(queue))
	for _, item := range queue {
		if item == token {
			continue
		}
		updated = append(updated, item)
	}

	if len(updated) == 0 {
		delete(h.queues, queueKey)
		return
	}
	h.queues[queueKey] = updated
}

func (h *Hub) sendToSessionLocked(session *playerSession, event ServerEvent) {
	if session == nil || session.ClientID == "" {
		return
	}
	h.sendLocked(session.ClientID, event)
}

func (h *Hub) sendLocked(clientID string, event ServerEvent) {
	cc := h.clients[clientID]
	if cc == nil {
		return
	}

	payload, err := json.Marshal(event)
	if err != nil {
		log.Printf("ws send marshal error: %v", err)
		return
	}
	select {
	case cc.send <- payload:
	default:
		// Client buffer full — drop the message. The write pump will
		// eventually notice the dead connection and exit.
		log.Printf("ws send buffer full for %s, dropping message", clientID)
	}
}

func (h *Hub) broadcastRoomLocked(room *raceRoom, event ServerEvent) {
	payload, err := json.Marshal(event)
	if err != nil {
		log.Printf("ws broadcast marshal error: %v", err)
		return
	}

	for _, token := range room.Participants {
		session, ok := h.sessions[token]
		if !ok || session.ClientID == "" {
			continue
		}
		cc := h.clients[session.ClientID]
		if cc == nil {
			continue
		}
		select {
		case cc.send <- payload:
		default:
			log.Printf("ws broadcast buffer full for %s, dropping message", session.ClientID)
		}
	}
}

func (h *Hub) broadcastLocked(event ServerEvent) {
	payload, err := json.Marshal(event)
	if err != nil {
		log.Printf("ws broadcast marshal error: %v", err)
		return
	}

	for clientID, cc := range h.clients {
		if cc == nil {
			continue
		}
		select {
		case cc.send <- payload:
		default:
			log.Printf("ws broadcast buffer full for %s, dropping message", clientID)
		}
	}
}

func queueKeyFor(hubName string, mode string, capacity int) string {
	return fmt.Sprintf("%s|%s|%d", hubName, mode, capacity)
}

func parseQueueCapacity(queueKey string) int {
	parts := strings.Split(queueKey, "|")
	if len(parts) < 3 {
		return 2
	}
	return parseIntOrDefault(parts[2], 2)
}

func parseIntOrDefault(value string, fallback int) int {
	parsed, err := strconv.Atoi(value)
	if err != nil || parsed < 1 {
		return fallback
	}
	return parsed
}

func normalizeHub(value string) string {
	v := strings.TrimSpace(strings.ToLower(value))
	if v == "" {
		return "go"
	}
	return v
}

func normalizeMode(value string) string {
	v := strings.TrimSpace(strings.ToLower(value))
	if v == "" {
		return "sprint"
	}
	return v
}

func normalizeCapacity(value int) int {
	if value < 2 {
		return 2
	}
	if value > 8 {
		return 8
	}
	return value
}

func removeString(values []string, target string) []string {
	res := make([]string, 0, len(values))
	for _, value := range values {
		if value == target {
			continue
		}
		res = append(res, value)
	}
	return res
}

func roomStatusMessage(room *raceRoom) string {
	switch room.Status {
	case "active":
		return "race active"
	case "starting":
		return "countdown in progress"
	case "finished":
		return "race finished"
	case "cancelled":
		return "race cancelled"
	case "waiting":
		return "room ready"
	}
	// Fallback to derived status for backwards compatibility
	if room.RaceActive {
		return "race active"
	}
	if room.Countdown > 0 {
		return "countdown in progress"
	}
	if room.FinishedAt != nil {
		return "race finished"
	}
	return "room ready"
}

func boolMessage(condition bool, yes string, no string) string {
	if condition {
		return yes
	}
	return no
}
