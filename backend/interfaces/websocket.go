package interfaces

import (
	"live-chat-server/ws"
)

// WebSocketService handles WebSocket client initialization and management
type WebSocketService interface {
	InitializeClient(c *ws.Conn, userID, userType, inboxID string) *ws.Client
}
