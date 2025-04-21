package listeners

import (
	"live-chat-server/interfaces"
	"live-chat-server/repositories"
	"log"

	"go.uber.org/dig"
)

// RegisterListeners registers all listeners in the DI container
func RegisterListeners(container *dig.Container) {
	// Register the contact listener
	if err := container.Provide(func(dispatcher interfaces.Dispatcher, pubSub interfaces.PubSub) *ContactListener {
		return NewContactListener(dispatcher, pubSub)
	}); err != nil {
		log.Fatalf("Failed to provide contact listener: %v", err)
	}

	// Register the conversation listener
	if err := container.Provide(func(dispatcher interfaces.Dispatcher, pubSub interfaces.PubSub, conversationRepo repositories.ConversationRepository, logger interfaces.Logger) *ConversationListener {
		return NewConversationListener(dispatcher, pubSub, conversationRepo, logger)
	}); err != nil {
		log.Fatalf("Failed to provide conversation listener: %v", err)
	}

	// Register the inbox listener
	if err := container.Provide(func(dispatcher interfaces.Dispatcher, pubSub interfaces.PubSub) *InboxListener {
		return NewInboxListener(dispatcher, pubSub)
	}); err != nil {
		log.Fatalf("Failed to provide inbox listener: %v", err)
	}

	// Instantiate the listeners to ensure they're created and subscribed
	if err := container.Invoke(func(
		contactListener *ContactListener,
		conversationListener *ConversationListener,
		inboxListener *InboxListener,
	) {
	}); err != nil {
		log.Fatalf("Failed to instantiate listeners: %v", err)
	}
}
