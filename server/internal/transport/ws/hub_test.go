package ws

import (
	"testing"
)

func TestHubAddCountRemove(t *testing.T) {
	h := NewHub()

	id1, cc1 := h.Add(nil, "", PlayerIdentity{})
	id2, cc2 := h.Add(nil, "", PlayerIdentity{})

	if id1 == id2 {
		t.Fatalf("expected unique ids, got %q and %q", id1, id2)
	}

	if got := h.Count(); got != 2 {
		t.Fatalf("expected 2 clients, got %d", got)
	}

	h.Remove(id1, cc1)
	if got := h.Count(); got != 1 {
		t.Fatalf("expected 1 client after remove, got %d", got)
	}

	h.Remove(id2, cc2)
	if got := h.Count(); got != 0 {
		t.Fatalf("expected 0 clients after remove, got %d", got)
	}
}

func TestHubBroadcastWithNoClients(t *testing.T) {
	h := NewHub()

	h.Broadcast(ServerEvent{Type: "noop"})

	if got := h.Count(); got != 0 {
		t.Fatalf("expected 0 clients, got %d", got)
	}
}

func TestHandleJoinRoomMarksParticipantJoined(t *testing.T) {
	h := NewHub()
	id, _ := h.Add(nil, "", PlayerIdentity{})

	h.HandleJoinRoom(id)

	h.mu.Lock()
	defer h.mu.Unlock()

	token := h.clientToSession[id]
	if token == "" {
		t.Fatalf("session token missing for %s", id)
	}
	session := h.sessions[token]
	if session == nil {
		t.Fatalf("session missing for token %s", token)
	}
	if session.QueueKey == "" {
		t.Fatal("expected session to be queued")
	}
}
