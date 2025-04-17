package websocket

import (
	"live-chat-server/factory"
	"live-chat-server/interfaces"
	"log"

	"go.uber.org/dig"
)

// RegisterWebSocketServices registers all WebSocket services in the DI container
func RegisterWebSocketServices(container *dig.Container) {
	// WebSocket service
	if err := container.Provide(factory.NewWebSocketService); err != nil {
		log.Fatalf("Failed to provide websocket service: %v", err)
	}

	// WebSocket handler
	if err := container.Provide(func(s interfaces.WebSocketService, l interfaces.Logger) interfaces.WebSocketHandlerInterface {
		return NewWebSocketHandler(s, l)
	}); err != nil {
		log.Fatalf("Failed to provide WebSocketHandler: %v", err)
	}
}
