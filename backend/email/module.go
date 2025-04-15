package email

import (
	"log"

	"go.uber.org/dig"
)

// RegisterEmailService registers the email provider in the DI container
// The actual provider factory is defined elsewhere
func RegisterEmailService(container *dig.Container, providerFactory interface{}) {
	if err := container.Provide(providerFactory); err != nil {
		log.Fatalf("Failed to provide email provider: %v", err)
	}
}
