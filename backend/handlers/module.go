package handler

import (
	"log"

	"go.uber.org/dig"
)

// RegisterHandlers registers all handlers in the DI container
func RegisterHandlers(container *dig.Container) {
	// Register handlers
	if err := container.Provide(NewCompanyHandler); err != nil {
		log.Fatalf("Failed to provide company handler: %v", err)
	}

	if err := container.Provide(NewContactHandler); err != nil {
		log.Fatalf("Failed to provide contact handler: %v", err)
	}

	if err := container.Provide(NewProfileHandler); err != nil {
		log.Fatalf("Failed to provide profile handler: %v", err)
	}

	if err := container.Provide(NewInboxHandler); err != nil {
		log.Fatalf("Failed to provide inbox handler: %v", err)
	}

	if err := container.Provide(NewOnboardingHandler); err != nil {
		log.Fatalf("Failed to provide onboarding handler: %v", err)
	}

	if err := container.Provide(NewConversationHandler); err != nil {
		log.Fatalf("Failed to provide conversation handler: %v", err)
	}

	if err := container.Provide(NewLanguageHandler); err != nil {
		log.Fatalf("Failed to provide language handler: %v", err)
	}

	if err := container.Provide(NewWebSocketHandler); err != nil {
		panic(err)
	}

	if err := container.Provide(NewPublicHandler); err != nil {
		log.Fatalf("Failed to provide public handler: %v", err)
	}
}
