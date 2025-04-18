package interfaces

import (
	"live-chat-server/config"
	"live-chat-server/email"
	"live-chat-server/repositories"
	"live-chat-server/storage"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/dig"
)

// JobClient defines the interface for the job client
type JobClient interface {
	Enqueue(jobName string, payload interface{}) error
}

// WebSocketHandlerInterface defines the interface for websocket handler
type WebSocketHandlerInterface interface {
	HandleWebSocket(ctx *fiber.Ctx) error
}

// Container defines the methods available in our DI container
type Container interface {
	GetInboxRepo() repositories.InboxRepository
	GetContactRepo() repositories.ContactRepository
	GetUserRepo() repositories.UserRepository
	GetCompanyRepo() repositories.CompanyRepository
	GetConversationRepo() repositories.ConversationRepository
	GetDispatcher() Dispatcher
	GetWebSocketService() WebSocketService
	GetWebSocketHandler() WebSocketHandlerInterface
	GetDiskManager() storage.Manager
	GetJobClient() JobClient
	GetEmailProvider() email.EmailProvider
	GetSecurityContext() SecurityContext
	GetLogger() Logger
	GetI18n() I18n
	GetLanguageContext() LanguageContext
	GetUploadService() UploadService
	GetConfig() config.Config
	GetDig() *dig.Container
}
