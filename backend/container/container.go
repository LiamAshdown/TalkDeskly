package container

import (
	"live-chat-server/config"
	"live-chat-server/disk"
	"live-chat-server/email"
	"live-chat-server/factory"
	handler "live-chat-server/handlers"
	"live-chat-server/interfaces"
	"live-chat-server/jobs"
	"live-chat-server/repositories"
	"live-chat-server/services"
	"live-chat-server/storage"
	"live-chat-server/websocket"
	"log"

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

// GetWebSocketService retrieves the websocket service
func (c *DIContainer) GetWebSocketService() interfaces.WebSocketService {
	var service interfaces.WebSocketService
	c.dig.Invoke(func(s interfaces.WebSocketService) {
		service = s
	})
	return service
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

// GetEmailProvider retrieves the email provider
func (c *DIContainer) GetEmailProvider() email.EmailProvider {
	var provider email.EmailProvider
	c.dig.Invoke(func(p email.EmailProvider) {
		provider = p
	})
	return provider
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

// GetConfig retrieves the config
func (c *DIContainer) GetConfig() config.Config {
	var cfg config.Config
	c.dig.Invoke(func(c config.Config) {
		cfg = c
	})
	return cfg
}

// GetDig returns the underlying dig container
func (c *DIContainer) GetDig() *dig.Container {
	return c.dig
}

// NewContainer creates a new container with DI
func NewContainer(db *gorm.DB) interfaces.Container {
	digContainer := dig.New()

	// Register DB
	if err := digContainer.Provide(func() *gorm.DB { return db }); err != nil {
		log.Fatalf("Failed to provide db: %v", err)
	}

	// Register logger
	if err := digContainer.Provide(factory.NewLogger); err != nil {
		log.Fatalf("Failed to provide logger: %v", err)
	}

	// Register config
	if err := digContainer.Provide(config.NewConfig); err != nil {
		log.Fatalf("Failed to provide config: %v", err)
	}

	// Register dependencies using modular approach
	repositories.RegisterRepositories(digContainer)
	services.RegisterServices(digContainer)

	// Register email provider using factory
	email.RegisterEmailService(digContainer, factory.NewEmailProvider)

	// Create container
	containerImpl := &DIContainer{
		dig: digContainer,
	}

	// Register storage services
	disk.RegisterStorageServices(digContainer)

	// Register WebSocket services
	websocket.RegisterWebSocketServices(digContainer)

	// Register handlers
	handler.RegisterHandlers(digContainer)

	// Register container itself
	if err := digContainer.Provide(func() interfaces.Container { return containerImpl }); err != nil {
		log.Fatalf("Failed to provide container: %v", err)
	}

	// Register job client
	if err := digContainer.Provide(func(cfg config.Config) interfaces.JobClient {
		return jobs.NewClient(cfg.RedisAddr)
	}); err != nil {
		log.Printf("Failed to provide job client: %v", err)
	}

	return containerImpl
}

// StartJobServer initializes and starts the job server
// This should be called after the container is fully initialized
func StartJobServer(container interfaces.Container) *jobs.Server {
	config := container.GetConfig()
	jobServer := jobs.RegisterJobServer(
		config.RedisAddr,
		container.GetEmailProvider(),
		container.GetLogger(),
	)
	return jobServer
}
