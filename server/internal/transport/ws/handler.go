package ws

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/fj-onathan/keyduel/server/internal/session"
	"github.com/gorilla/websocket"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ClientEvent struct {
	Type           string `json:"type"`
	Hub            string `json:"hub,omitempty"`
	Mode           string `json:"mode,omitempty"`
	Capacity       int    `json:"capacity,omitempty"`
	ReconnectToken string `json:"reconnectToken,omitempty"`
	RoomID         string `json:"roomId,omitempty"`
	RaceID         string `json:"raceId,omitempty"`
	Progress       int    `json:"progress"`
	Errors         int    `json:"errors"`
	AddBots        bool   `json:"addBots,omitempty"`
}

type ServerEvent struct {
	Type           string                `json:"type"`
	RoomID         string                `json:"roomId,omitempty"`
	RaceID         string                `json:"raceId,omitempty"`
	ClientID       string                `json:"clientId,omitempty"`
	DisplayName    string                `json:"displayName,omitempty"`
	AvatarURL      string                `json:"avatarUrl,omitempty"`
	Connected      int                   `json:"connected"`
	SessionToken   string                `json:"sessionToken,omitempty"`
	QueueKey       string                `json:"queueKey,omitempty"`
	Position       int                   `json:"position"`
	Message        string                `json:"message,omitempty"`
	Countdown      int                   `json:"countdown"`
	Snippet        string                `json:"snippet,omitempty"`
	SnippetLen     int                   `json:"snippetLen"`
	DurationMS     int64                 `json:"durationMs,omitempty"`
	RaceDurationMS int64                 `json:"raceDurationMs,omitempty"`
	ElapsedMS      int64                 `json:"elapsedMs,omitempty"`
	Participants   []ParticipantSnapshot `json:"participants,omitempty"`
	Results        []RaceResult          `json:"results,omitempty"`
	LeaderID       string                `json:"leaderId,omitempty"`
	YourProgress   int                   `json:"yourProgress"`
}

type ParticipantSnapshot struct {
	ClientID    string  `json:"clientId"`
	DisplayName string  `json:"displayName,omitempty"`
	AvatarURL   string  `json:"avatarUrl,omitempty"`
	Progress    int     `json:"progress"`
	Errors      int     `json:"errors"`
	GrossWPM    float64 `json:"grossWpm"`
	NetWPM      float64 `json:"netWpm"`
	Accuracy    float64 `json:"accuracy"`
	Finished    bool    `json:"finished"`
	IsBot       bool    `json:"isBot,omitempty"`
}

type RaceResult struct {
	ClientID          string  `json:"clientId"`
	AuthUserID        string  `json:"authUserId,omitempty"`  // real user ID from session auth (empty for guests)
	DisplayName       string  `json:"displayName,omitempty"` // display name from user profile
	AvatarURL         string  `json:"avatarUrl,omitempty"`   // avatar URL from user profile
	Position          int     `json:"position"`
	CompletionPercent float64 `json:"completionPercent"`
	Progress          int     `json:"progress"`
	GrossWPM          float64 `json:"grossWpm"`
	NetWPM            float64 `json:"netWpm"`
	Accuracy          float64 `json:"accuracy"`
	Errors            int     `json:"errors"`
	Finished          bool    `json:"finished"`
	FinishedElapsedMS int64   `json:"finishedElapsedMs"`
	Suspicious        bool    `json:"suspicious"`
	IsBot             bool    `json:"isBot,omitempty"`
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(_ *http.Request) bool {
		return true
	},
}

const (
	// pongWait is how long the server waits for a pong before closing.
	pongWait = 60 * time.Second

	// pingInterval must be less than pongWait so the server pings before the
	// read deadline expires.
	pingInterval = 30 * time.Second

	// writeWait is the time allowed to write a message to the peer.
	writeWait = 10 * time.Second
)

func NewHandler(hub *Hub, sessions *session.Store, db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("ws upgrade error: %v", err)
			return
		}

		// Use stable guest ID from query param if provided, otherwise
		// fall back to the auto-incrementing counter.
		guestID := r.URL.Query().Get("guestId")

		// Resolve authenticated user identity from session cookie, if present.
		var identity PlayerIdentity
		if sessions != nil {
			if cookie, err := r.Cookie("session_id"); err == nil && cookie.Value != "" {
				if sess, err := sessions.Get(r.Context(), cookie.Value); err == nil {
					identity.AuthUserID = sess.UserID

					// Look up display name and avatar from the user's profile.
					if db != nil {
						var displayName string
						var avatarURL sql.NullString
						err := db.QueryRow(r.Context(), `
							SELECT COALESCE(NULLIF(p.display_name, ''), p.username), p.avatar_url
							FROM profiles p WHERE p.user_id = $1
						`, sess.UserID).Scan(&displayName, &avatarURL)
						if err == nil {
							identity.DisplayName = displayName
							identity.AvatarURL = avatarURL.String
						}
					}
				}
			}
		}

		clientID, cc := hub.Add(conn, guestID, identity)

		// Set initial read deadline and pong handler to extend it.
		_ = conn.SetReadDeadline(time.Now().Add(pongWait))
		conn.SetPongHandler(func(string) error {
			_ = conn.SetReadDeadline(time.Now().Add(pongWait))
			return nil
		})

		// Send welcome and presence via the write pump (non-blocking enqueue).
		hub.Send(clientID, ServerEvent{
			Type:        "connected",
			ClientID:    clientID,
			DisplayName: identity.DisplayName,
			AvatarURL:   identity.AvatarURL,
			Connected:   hub.Count(),
		})

		hub.Broadcast(ServerEvent{
			Type:      "presence_update",
			ClientID:  clientID,
			Connected: hub.Count(),
			Message:   "player joined",
		})

		// Pass cc so Remove can verify it's still the active connection
		// for this clientID (prevents a stale defer from removing a
		// newer replacement connection).
		defer hub.Remove(clientID, cc)

		for {
			messageType, message, err := conn.ReadMessage()
			if err != nil {
				return
			}

			// Any incoming message also resets the read deadline.
			_ = conn.SetReadDeadline(time.Now().Add(pongWait))

			if messageType != websocket.TextMessage {
				continue
			}

			var event ClientEvent
			if err := json.Unmarshal(message, &event); err != nil {
				hub.Send(clientID, ServerEvent{Type: "error", Message: "invalid payload"})
				continue
			}

			switch event.Type {
			case "join_room":
				hub.HandleJoinRoom(clientID)
			case "join_race":
				hub.HandleJoinRace(clientID, event.RaceID, event.ReconnectToken)
			case "queue_race":
				hub.HandleQueueRace(clientID, event.Hub, event.Mode, event.Capacity, event.ReconnectToken)
			case "leave_queue":
				hub.HandleLeaveQueue(clientID)
			case "leave_room":
				hub.HandleLeaveRoom(clientID)
			case "start_race":
				hub.HandleStartRace(clientID)
			case "confirm_start":
				hub.HandleConfirmStart(clientID, event.AddBots)
			case "race_input":
				hub.HandleRaceInput(clientID, event.Progress, event.Errors)
			case "heartbeat":
				hub.HandleHeartbeat(clientID, event.ReconnectToken)
			default:
				hub.Send(clientID, ServerEvent{Type: "error", Message: "unsupported event type"})
			}
		}
	}
}
