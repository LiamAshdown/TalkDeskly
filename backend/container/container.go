package container

import (
	"live-chat-server/config"
	"live-chat-server/context"
	"live-chat-server/disk"
	"live-chat-server/email"
	"live-chat-server/factory"
	handler "live-chat-server/handlers"
	"live-chat-server/i18n"
	"live-chat-server/interfaces"
	"live-chat-server/jobs"
	"live-chat-server/listeners"
	"live-chat-server/repositories"
	"live-chat-server/services"
	"live-chat-server/storage"
	"log"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/dig"
	"gorm.io/gorm"
)

// DIContainer implements interfaces.Container using Dig
type DIContainer struct {
	dig *dig.Container
}

// NewDIContainer creates a Container implementation that uses Dig
func NewDIContainer(digContainer *dig.Container) interfaces.Container {
	return &DIContainer{
		dig: digContainer,
	}
}

// GetInboxRepo retrieves the inbox repository
func (c *DIContainer) GetInboxRepo() repositories.InboxRepository {
	var repo repositories.InboxRepository
	c.dig.Invoke(func(r repositories.InboxRepository) {
		repo = r
	})
	return repo
}

// GetContactRepo retrieves the contact repository
func (c *DIContainer) GetContactRepo() repositories.ContactRepository {
	var repo repositories.ContactRepository
	c.dig.Invoke(func(r repositories.ContactRepository) {
		repo = r
	})
	return repo
}

// GetUserRepo retrieves the user repository
func (c *DIContainer) GetUserRepo() repositories.UserRepository {
	var repo repositories.UserRepository
	c.dig.Invoke(func(r repositories.UserRepository) {
		repo = r
	})
	return repo
}

// GetCompanyRepo retrieves the company repository
func (c *DIContainer) GetCompanyRepo() repositories.CompanyRepository {
	var repo repositories.CompanyRepository
	c.dig.Invoke(func(r repositories.CompanyRepository) {
		repo = r
	})
	return repo
}

// GetCannedResponseRepo retrieves the canned response repository
func (c *DIContainer) GetCannedResponseRepo() repositories.CannedResponseRepository {
	var repo repositories.CannedResponseRepository
	c.dig.Invoke(func(r repositories.CannedResponseRepository) {
		repo = r
	})
	return repo
}

// GetConversationRepo retrieves the conversation repository
func (c *DIContainer) GetConversationRepo() repositories.ConversationRepository {
	var repo repositories.ConversationRepository
	c.dig.Invoke(func(r repositories.ConversationRepository) {
		repo = r
	})
	return repo
}

// GetDispatcher retrieves the dispatcher
func (c *DIContainer) GetDispatcher() interfaces.Dispatcher {
	var dispatcher interfaces.Dispatcher
	c.dig.Invoke(func(d interfaces.Dispatcher) {
		dispatcher = d
	})
	return dispatcher
}

// GetDiskManager retrieves the disk manager
func (c *DIContainer) GetDiskManager() storage.Manager {
	var manager storage.Manager
	c.dig.Invoke(func(m storage.Manager) {
		manager = m
	})
	return manager
}

// GetJobClient retrieves the job client
func (c *DIContainer) GetJobClient() interfaces.JobClient {
	var client interfaces.JobClient
	c.dig.Invoke(func(jc interfaces.JobClient) {
		client = jc
	})
	return client
}

// GetEmailService retrieves the email service
func (c *DIContainer) GetEmailService() interfaces.EmailService {
	var service interfaces.EmailService
	c.dig.Invoke(func(s interfaces.EmailService) {
		service = s
	})
	return service
}

// GetSecurityContext retrieves the security context
func (c *DIContainer) GetSecurityContext() interfaces.SecurityContext {
	var context interfaces.SecurityContext
	c.dig.Invoke(func(sc interfaces.SecurityContext) {
		context = sc
	})
	return context
}

// GetLogger retrieves the logger
func (c *DIContainer) GetLogger() interfaces.Logger {
	var logger interfaces.Logger
	c.dig.Invoke(func(l interfaces.Logger) {
		logger = l
	})
	return logger
}

// GetI18n retrieves the i18n service
func (c *DIContainer) GetI18n() interfaces.I18n {
	var i18n interfaces.I18n
	c.dig.Invoke(func(s interfaces.I18n) {
		i18n = s
	})
	return i18n
}

// GetLanguageContext retrieves the language context
func (c *DIContainer) GetLanguageContext() interfaces.LanguageContext {
	var langContext interfaces.LanguageContext
	c.dig.Invoke(func(lc interfaces.LanguageContext) {
		langContext = lc
	})
	return langContext
}

// GetConfig retrieves the config
func (c *DIContainer) GetConfig() config.ConfigManager {
	var cfg config.ConfigManager
	c.dig.Invoke(func(cm config.ConfigManager) {
		cfg = cm
	})
	return cfg
}

// GetUploadService retrieves the upload service
func (c *DIContainer) GetUploadService() interfaces.UploadService {
	var service interfaces.UploadService
	c.dig.Invoke(func(s interfaces.UploadService) {
		service = s
	})
	return service
}

// GetConversationHandler retrieves the conversation handler
func (c *DIContainer) GetConversationHandler() interfaces.ConversationHandler {
	var handler interfaces.ConversationHandler
	c.dig.Invoke(func(h interfaces.ConversationHandler) {
		handler = h
	})
	return handler
}

// GetCommandFactory retrieves the command factory
func (c *DIContainer) GetCommandFactory() interfaces.CommandFactory {
	var factory interfaces.CommandFactory
	c.dig.Invoke(func(f interfaces.CommandFactory) {
		factory = f
	})
	return factory
}

// GetDig returns the underlying dig container
func (c *DIContainer) GetDig() *dig.Container {
	return c.dig
}

// GetNotificationService retrieves the notification service
func (c *DIContainer) GetNotificationService() interfaces.NotificationService {
	var service interfaces.NotificationService
	c.dig.Invoke(func(s interfaces.NotificationService) {
		service = s
	})
	return service
}

// GetPubSubService retrieves the pubsub service
func (c *DIContainer) GetPubSubService() interfaces.PubSub {
	var service interfaces.PubSub
	c.dig.Invoke(func(s interfaces.PubSub) {
		service = s
	})
	return service
}

// GetHealthService retrieves the health service
func (c *DIContainer) GetHealthService() interfaces.HealthService {
	var service interfaces.HealthService
	c.dig.Invoke(func(s interfaces.HealthService) {
		service = s
	})
	return service
}

// GetResponseFactory retrieves the response factory
func (c *DIContainer) GetResponseFactory() interfaces.ResponseFactory {
	var factory interfaces.ResponseFactory
	c.dig.Invoke(func(f interfaces.ResponseFactory) {
		factory = f
	})
	return factory
}

// NewContainer creates a new container with DI
func NewContainer(db *gorm.DB, app *fiber.App) interfaces.Container {
	digContainer := dig.New()

	// Register DB
	if err := digContainer.Provide(func() *gorm.DB { return db }); err != nil {
		log.Fatalf("Failed to provide db: %v", err)
	}

	// Register the Fiber app in the DI container
	if err := digContainer.Provide(func() *fiber.App { return app }); err != nil {
		panic(err)
	}

	// Register config - clean and simple!
	if err := digContainer.Provide(config.NewConfigManager); err != nil {
		log.Fatalf("Failed to provide config: %v", err)
	}

	// Register job client
	if err := digContainer.Provide(func(cfg config.ConfigManager) interfaces.JobClient {
		return jobs.NewClient(cfg.GetConfig().RedisAddr)
	}); err != nil {
		log.Printf("Failed to provide job client: %v", err)
	}

	// Create container
	containerImpl := &DIContainer{
		dig: digContainer,
	}

	if err := digContainer.Provide(func() interfaces.Container { return containerImpl }); err != nil {
		log.Fatalf("Failed to provide container: %v", err)
	}

	repositories.RegisterRepositories(digContainer)
	email.RegisterEmailService(digContainer)
	factory.RegisterModule(digContainer)
	services.RegisterServices(digContainer)
	disk.RegisterStorageServices(digContainer)
	i18n.RegisterI18nServices(digContainer)
	context.RegisterContexts(digContainer)
	handler.RegisterHandlers(digContainer)
	listeners.RegisterListeners(digContainer)

	return containerImpl
}

// StartJobServer initializes and starts the job server
// This should be called after the container is fully initialized
func StartJobServer(container interfaces.Container) *jobs.Server {
	emailService := container.GetEmailService()
	config := container.GetConfig()
	jobServer := jobs.RegisterJobServer(
		config.GetConfig().RedisAddr,
		emailService,
		container.GetLogger(),
	)
	return jobServer
}
