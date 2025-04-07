package router

import (
	handler "live-chat-server/handlers"
	"live-chat-server/interfaces"
	"live-chat-server/middleware"
	"live-chat-server/websocket"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App, c interfaces.Container) {
	// WebSocket route
	app.Get("/ws", websocket.HandleWebSocket)

	apiGroup := app.Group("/api")

	onboardingHandler := handler.NewOnboardingHandler(c.GetUserRepo(), c.GetCompanyRepo())
	onboardingGroup := apiGroup.Group("/onboarding")
	onboardingGroup.Post("/user", onboardingHandler.HandleCreateUser)

	onboardingProtectedGroup := onboardingGroup.Group("/", middleware.Auth())
	onboardingProtectedGroup.Post("/company", onboardingHandler.HandleCreateCompany)

	inboxHandler := handler.NewInboxHandler(c.GetInboxRepo(), c.GetUserRepo(), c.GetDispatcher())
	inboxGroup := apiGroup.Group("/inbox", middleware.Auth())
	inboxGroup.Post("/", inboxHandler.HandleCreateInbox, middleware.IsAdmin())
	inboxGroup.Get("/:id", inboxHandler.HandleGetInbox)
	inboxGroup.Put("/:id", inboxHandler.HandleUpdateInbox, middleware.IsAdmin())
	inboxGroup.Get("/", inboxHandler.HandleListInboxes)
	inboxGroup.Put("/:id/users", inboxHandler.HandleUpdateInboxUsers, middleware.IsAdmin())

	contactHandler := handler.NewContactHandler(c.GetContactRepo(), c.GetDispatcher())
	contactGroup := apiGroup.Group("/contacts", middleware.Auth())
	contactGroup.Get("/", contactHandler.HandleListContacts)
	contactGroup.Get("/:id", contactHandler.HandleGetContact)
	contactGroup.Post("/", contactHandler.HandleCreateContact)
	contactGroup.Put("/:id", contactHandler.HandleUpdateContact)
	contactGroup.Delete("/:id", contactHandler.HandleDeleteContact)

	companyGroup := apiGroup.Group("/companies", middleware.Auth())
	companyGroup.Get("/", handler.GetCompany)
	companyGroup.Put("/", handler.UpdateCompany)
	companyGroup.Post("/logo", handler.UploadCompanyLogo)

	userGroup := apiGroup.Group("/profile", middleware.Auth())
	userGroup.Get("/", handler.GetProfile)
	userGroup.Put("/", handler.UpdateProfile)
	userGroup.Put("/password", handler.UpdateProfilePassword)

	// Admin user management routes
	adminUserGroup := apiGroup.Group("/users", middleware.Auth(), middleware.IsAdmin())
	adminUserGroup.Get("/", handler.GetUsers)
	adminUserGroup.Get("/:id", handler.GetUser)
	adminUserGroup.Post("/", handler.CreateCompanyUser)
	adminUserGroup.Put("/:id", handler.UpdateUser)

	notificationSettingsGroup := apiGroup.Group("/notification-settings", middleware.Auth())
	notificationSettingsGroup.Get("/", handler.GetNotificationSettings)
	notificationSettingsGroup.Put("/", handler.UpdateNotificationSettings)

	conversationHandler := handler.NewConversationHandler(c.GetConversationRepo(), c.GetContactRepo(), c.GetDispatcher())
	conversationGroup := apiGroup.Group("/conversations", middleware.Auth())
	conversationGroup.Get("/", conversationHandler.HandleListConversations)
	conversationGroup.Get("/:id", conversationHandler.HandleGetConversation)
}
