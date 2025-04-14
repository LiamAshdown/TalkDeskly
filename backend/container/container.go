package container

import (
	"live-chat-server/config"
	"live-chat-server/disk"
	"live-chat-server/email"
	"live-chat-server/factory"
	"live-chat-server/interfaces"
	"live-chat-server/jobs"
	"live-chat-server/repositories"
	"live-chat-server/storage"
	"log"

	"gorm.io/gorm"
)

type Container struct {
	inboxRepo        repositories.InboxRepository
	contactRepo      repositories.ContactRepository
	userRepo         repositories.UserRepository
	companyRepo      repositories.CompanyRepository
	conversationRepo repositories.ConversationRepository
	dispatcher       interfaces.Dispatcher
	webSocketSvc     interfaces.WebSocketService
	diskManager      storage.Manager
	jobServer        *jobs.Server
	emailProvider    email.EmailProvider
}

func NewContainer(db *gorm.DB) interfaces.Container {
	c := &Container{
		inboxRepo:        repositories.NewInboxRepository(db),
		contactRepo:      repositories.NewContactRepository(db),
		userRepo:         repositories.NewUserRepository(db),
		companyRepo:      repositories.NewCompanyRepository(db),
		conversationRepo: repositories.NewConversationRepository(db),
	}

	// Initialize services
	c.dispatcher = factory.NewDispatcher()
	c.webSocketSvc = factory.NewWebSocketService(c)
	c.emailProvider = factory.NewEmailProvider()
	c.jobServer = jobs.InitJobServer(config.App.RedisAddr, c)

	diskManager := disk.Initialize()
	err := diskManager.CreateStorage(storage.Config{
		Type:     storage.LocalType,
		BasePath: "./uploads",
	})

	if err != nil {
		log.Fatal(err)
	}

	c.diskManager = diskManager

	return c
}

func (c *Container) GetInboxRepo() repositories.InboxRepository {
	return c.inboxRepo
}

func (c *Container) GetContactRepo() repositories.ContactRepository {
	return c.contactRepo
}

func (c *Container) GetUserRepo() repositories.UserRepository {
	return c.userRepo
}

func (c *Container) GetCompanyRepo() repositories.CompanyRepository {
	return c.companyRepo
}

func (c *Container) GetConversationRepo() repositories.ConversationRepository {
	return c.conversationRepo
}

func (c *Container) GetDispatcher() interfaces.Dispatcher {
	return c.dispatcher
}

func (c *Container) GetWebSocketService() interfaces.WebSocketService {
	return c.webSocketSvc
}

func (c *Container) GetDiskManager() storage.Manager {
	return c.diskManager
}

func (c *Container) GetJobClient() *jobs.Client {
	return c.jobServer.Client
}

func (c *Container) GetEmailProvider() email.EmailProvider {
	return c.emailProvider
}
