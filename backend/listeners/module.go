package listeners

import (
	"log"

	"go.uber.org/dig"
)

// RegisterListeners registers all listeners in the DI container
func RegisterListeners(container *dig.Container) {
	// Register the contact listener
	if err := container.Provide(NewContactListener); err != nil {
		log.Fatalf("Failed to provide contact listener: %v", err)
	}

	// Register the conversation listener
	if err := container.Provide(NewConversationListener); err != nil {
		log.Fatalf("Failed to provide conversation listener: %v", err)
	}

	// Register the inbox listener
	if err := container.Provide(NewInboxListener); err != nil {
		log.Fatalf("Failed to provide inbox listener: %v", err)
	}

	// Register the user listener
	if err := container.Provide(NewUserListener); err != nil {
		log.Fatalf("Failed to provide user listener: %v", err)
	}

	// Register the auth listener
	if err := container.Provide(NewAuthListener); err != nil {
		log.Fatal("Failed to provide auth listener: %v", err)
	}

	// Instantiate the listeners to ensure they're created and subscribed
	if err := container.Invoke(func(
		contactListener *ContactListener,
		conversationListener *ConversationListener,
		inboxListener *InboxListener,
		userListener *UserListener,
		authListener *AuthListener,
	) {
	}); err != nil {
		log.Fatalf("Failed to instantiate listeners: %v", err)
	}
}
