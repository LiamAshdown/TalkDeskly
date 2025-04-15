package factory

import (
	"live-chat-server/config"
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

// NewSecurityContext creates a new security context
func NewSecurityContext() interfaces.SecurityContext {
	return services.NewSecurityContext()
}

// NewLogger creates a new logger instance
func NewLogger() interfaces.Logger {
	return services.NewLogger(config.App.Environment)
}
