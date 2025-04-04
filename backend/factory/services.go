package factory

import (
	"live-chat-server/interfaces"
	"live-chat-server/services"
)

// NewDispatcher creates a new event dispatcher
func NewDispatcher() interfaces.Dispatcher {
	return services.GetDispatcher()
}

// NewWebSocketService creates a new WebSocket service
func NewWebSocketService(c interfaces.Container) interfaces.WebSocketService {
	return services.NewWebSocketService(c)
}
