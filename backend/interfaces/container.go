package interfaces

import (
	"live-chat-server/config"
	"live-chat-server/repositories"
	"live-chat-server/storage"

	"go.uber.org/dig"
)

// JobClient defines the interface for the job client
type JobClient interface {
	Enqueue(jobName string, payload interface{}) error
}

// Container defines the methods available in our DI container
type Container interface {
	GetInboxRepo() repositories.InboxRepository
	GetContactRepo() repositories.ContactRepository
	GetUserRepo() repositories.UserRepository
	GetCompanyRepo() repositories.CompanyRepository
	GetConversationRepo() repositories.ConversationRepository
	GetDispatcher() Dispatcher
	GetDiskManager() storage.Manager
	GetJobClient() JobClient
	GetEmailService() EmailService
	GetSecurityContext() SecurityContext
	GetLogger() Logger
	GetI18n() I18n
	GetLanguageContext() LanguageContext
	GetUploadService() UploadService
	GetConfig() config.Config
	GetDig() *dig.Container
	GetConversationHandler() ConversationHandler
	GetCommandFactory() CommandFactory
	GetNotificationService() NotificationService
	GetPubSubService() PubSub
	GetHealthService() HealthService
}
