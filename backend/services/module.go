package services

import (
	"live-chat-server/interfaces"
	"live-chat-server/repositories"
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

	// Register health service
	if err := container.Provide(NewHealthService); err != nil {
		log.Fatalf("Failed to provide health service: %v", err)
	}

	// Register audit service
	if err := container.Provide(func(auditRepo repositories.AuditRepository, logger interfaces.Logger) AuditService {
		return NewAuditService(auditRepo, logger)
	}); err != nil {
		log.Fatalf("Failed to provide audit service: %v", err)
	}
}
