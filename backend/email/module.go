package email

import (
	"live-chat-server/config"
	"live-chat-server/interfaces"
	"log"

	"go.uber.org/dig"
)

func RegisterEmailService(container *dig.Container) {
	// Register email factory
	if err := container.Provide(NewEmailFactory); err != nil {
		log.Fatalf("Failed to provide email factory: %v", err)
	}

	// Register template renderer
	if err := container.Provide(func(logger interfaces.Logger) interfaces.EmailTemplateRenderer {
		return NewTemplateRenderer(logger)
	}); err != nil {
		log.Fatalf("Failed to provide email template renderer: %v", err)
	}

	// Register email service
	if err := container.Provide(func(
		factory *EmailFactory,
		cfg config.Config,
	) interfaces.EmailService {
		emailConfig, err := CreateEmailConfigFromEnv(
			cfg.EmailProvider,
			cfg.EmailHost,
			cfg.EmailPort,
			cfg.EmailUsername,
			cfg.EmailPassword,
			cfg.EmailFrom,
		)
		if err != nil {
			log.Fatalf("Failed to create email config: %v", err)
		}

		service, err := factory.CreateEmailService(emailConfig)
		if err != nil {
			log.Fatalf("Failed to create email service: %v", err)
		}

		return service
	}); err != nil {
		log.Fatalf("Failed to provide email service: %v", err)
	}
}
