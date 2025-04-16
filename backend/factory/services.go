package factory

import (
	"live-chat-server/interfaces"
	"live-chat-server/services"
)

// NewWebSocketService creates a new WebSocket service
func NewWebSocketService(c interfaces.Container) interfaces.WebSocketService {
	return services.NewWebSocketService(c)
}
