package interfaces

import (
	"live-chat-server/config"
	"live-chat-server/email"
	"live-chat-server/repositories"
	"live-chat-server/storage"

	"go.uber.org/dig"
)

// JobClient defines the interface for the job client
type JobClient interface {
	Enqueue(jobName string, payload interface{}) error
}

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
	GetJobClient() JobClient
	GetEmailProvider() email.EmailProvider
	GetSecurityContext() SecurityContext
	GetLogger() Logger
	GetConfig() config.Config
	GetDig() *dig.Container
}
