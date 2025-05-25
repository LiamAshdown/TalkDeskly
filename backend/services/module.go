package services

import (
	"live-chat-server/interfaces"
	"live-chat-server/storage"
	"log"

	"go.uber.org/dig"
)

// RegisterServices registers all services in the DI container
func RegisterServices(container *dig.Container) {
	if err := container.Provide(func() interfaces.Dispatcher { return GetDispatcher() }); err != nil {
		log.Fatalf("Failed to provide dispatcher: %v", err)
	}

	if err := container.Provide(NewLogger); err != nil {
		log.Fatalf("Failed to provide logger: %v", err)
	}

	// Register upload service and make it implement the interface
	if err := container.Provide(func(storage storage.Manager) interfaces.UploadService {
		return NewUploadService(storage, DefaultUploadConfig())
	}); err != nil {
		log.Fatalf("Failed to provide upload service: %v", err)
	}

	if err := container.Provide(NewPubSubService); err != nil {
		panic(err)
	}
	if err := container.Provide(NewWebSocketService); err != nil {
		panic(err)
	}

	if err := container.Provide(NewNotificationService); err != nil {
		panic(err)
	}
}
