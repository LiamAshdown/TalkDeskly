package interfaces

import (
	"live-chat-server/email"
	"live-chat-server/jobs"
	"live-chat-server/repositories"
	"live-chat-server/storage"
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
	GetDiskManager() storage.Manager
	GetJobClient() *jobs.Client
	GetEmailProvider() email.EmailProvider
	GetSecurityContext() SecurityContext
}
