package email

import (
	"live-chat-server/interfaces"
	"log"

	"go.uber.org/dig"
)

func RegisterEmailService(container *dig.Container) {
	if err := container.Provide(func() interfaces.EmailProvider {
		return &BaseEmailProvider{}
	}); err != nil {
		log.Fatalf("Failed to provide email provider: %v", err)
	}
}
