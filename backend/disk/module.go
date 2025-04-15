package disk

import (
	"live-chat-server/storage"
	"log"

	"go.uber.org/dig"
)

// RegisterStorageServices registers storage-related services in the DI container
func RegisterStorageServices(container *dig.Container) {
	// Initialize disk manager and make it available globally
	diskManager := Initialize()
	err := diskManager.CreateStorage(storage.Config{
		Type:     storage.LocalType,
		BasePath: "./uploads",
	})
	if err != nil {
		log.Fatal(err)
	}

	// Register disk manager
	if err := container.Provide(func() storage.Manager { return diskManager }); err != nil {
		log.Fatalf("Failed to provide disk manager: %v", err)
	}
}
