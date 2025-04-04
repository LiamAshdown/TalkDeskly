package interfaces

import (
	"live-chat-server/repositories"
)

// Container defines the interface for the dependency container
type Container interface {
	GetInboxRepo() repositories.InboxRepository
	GetContactRepo() repositories.ContactRepository
	GetUserRepo() repositories.UserRepository
	GetCompanyRepo() repositories.CompanyRepository
	GetConversationRepo() repositories.ConversationRepository
	GetDispatcher() Dispatcher
	GetWebSocketService() WebSocketService
}
