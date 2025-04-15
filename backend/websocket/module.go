package websocket

import (
	"live-chat-server/factory"
	"log"

	"go.uber.org/dig"
)

// RegisterWebSocketServices registers all WebSocket services in the DI container
func RegisterWebSocketServices(container *dig.Container) {
	// WebSocket service
	if err := container.Provide(factory.NewWebSocketService); err != nil {
		log.Fatalf("Failed to provide websocket service: %v", err)
	}

	// WebSocket manager
	if err := container.Provide(GetManager); err != nil {
		log.Fatalf("Failed to provide websocket manager: %v", err)
	}
}
