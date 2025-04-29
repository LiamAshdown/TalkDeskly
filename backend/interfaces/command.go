package interfaces

import "live-chat-server/repositories"

// Command represents a command that can be executed
type Command interface {
	// Handle executes the command
	Handle() (interface{}, error)
}

// CommandDependencies contains all the dependencies that commands might need
type CommandDependencies struct {
	ConversationRepo    repositories.ConversationRepository
	InboxRepo           repositories.InboxRepository
	ContactRepo         repositories.ContactRepository
	UserRepo            repositories.UserRepository
	Logger              Logger
	Dispatcher          Dispatcher
	LanguageContext     LanguageContext
	ConversationHandler ConversationHandler
	WebSocketService    WebSocketService
	PubSub              PubSub
	SecurityContext     SecurityContext
}
