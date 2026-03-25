package ws

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestWebSocketHandlerRejectsPlainHTTP(t *testing.T) {
	h := NewHub()
	handler := NewHandler(h, nil, nil)

	req := httptest.NewRequest(http.MethodGet, "/ws", nil)
	rec := httptest.NewRecorder()

	handler(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, rec.Code)
	}
}
