package interfaces

import (
	"live-chat-server/types"
)

// WebSocketService handles WebSocket client initialization and management
type WebSocketService interface {
	InitializeClient(c *types.WebSocketConn, userID, userType, inboxID string) *types.WebSocketClient
}
