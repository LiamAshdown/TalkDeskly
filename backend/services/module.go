package services

import (
	"log"

	"go.uber.org/dig"
)

// RegisterServices registers all services in the DI container
func RegisterServices(container *dig.Container) {
	// Register services
	if err := container.Provide(GetDispatcher); err != nil {
		log.Fatalf("Failed to provide dispatcher: %v", err)
	}

	if err := container.Provide(NewSecurityContext); err != nil {
		log.Fatalf("Failed to provide security context: %v", err)
	}
}
