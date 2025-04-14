package router

import (
	"live-chat-server/disk"
	handler "live-chat-server/handlers"
	"live-chat-server/interfaces"
	"live-chat-server/middleware"
	"live-chat-server/websocket"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App, c interfaces.Container) {
	// WebSocket route
	app.Get("/ws", websocket.HandleWebSocket)

	// Static file route
	app.Static("/uploads", disk.GetBasePath())

	apiGroup := app.Group("/api")

	onboardingHandler := handler.NewOnboardingHandler(c.GetUserRepo(), c.GetCompanyRepo(), c.GetJobClient(), c.GetEmailProvider())
	onboardingGroup := apiGroup.Group("/onboarding")
	onboardingGroup.Post("/user", onboardingHandler.HandleCreateUser)

	onboardingProtectedGroup := onboardingGroup.Group("/", middleware.OnboardingAuth())
	onboardingProtectedGroup.Post("/company", onboardingHandler.HandleCreateCompany)

	inboxHandler := handler.NewInboxHandler(c.GetInboxRepo(), c.GetUserRepo(), c.GetDispatcher())
	inboxGroup := apiGroup.Group("/inbox", middleware.Auth(), middleware.RequireCompany())
	inboxGroup.Post("/", inboxHandler.HandleCreateInbox, middleware.IsAdmin())
	inboxGroup.Get("/:id", inboxHandler.HandleGetInbox)
	inboxGroup.Put("/:id", inboxHandler.HandleUpdateInbox, middleware.IsAdmin())
	inboxGroup.Get("/", inboxHandler.HandleListInboxes)
	inboxGroup.Put("/:id/users", inboxHandler.HandleUpdateInboxUsers, middleware.IsAdmin())

	contactHandler := handler.NewContactHandler(c.GetContactRepo(), c.GetDispatcher())
	contactGroup := apiGroup.Group("/contacts", middleware.Auth(), middleware.RequireCompany())
	contactGroup.Get("/", contactHandler.HandleListContacts)
	contactGroup.Get("/:id", contactHandler.HandleGetContact)
	contactGroup.Post("/", contactHandler.HandleCreateContact)
	contactGroup.Put("/:id", contactHandler.HandleUpdateContact)
	contactGroup.Delete("/:id", contactHandler.HandleDeleteContact)
	contactGroup.Post("/:id/notes", contactHandler.HandleCreateContactNote)
	contactGroup.Get("/:id/notes", contactHandler.HandleListContactNotes)

	companyHandler := handler.NewCompanyHandler(c.GetCompanyRepo(), c.GetUserRepo(), c.GetDispatcher(), c.GetJobClient(), c.GetEmailProvider())
	companyGroup := apiGroup.Group("/companies")
	companyGroup.Get("/invite/:token", companyHandler.GetInvite)

	authCompanyGroup := apiGroup.Group("/companies", middleware.Auth(), middleware.RequireCompany())
	authCompanyGroup.Get("/", companyHandler.GetCompany)
	authCompanyGroup.Put("/", companyHandler.UpdateCompany)
	authCompanyGroup.Post("/logo", companyHandler.UploadCompanyLogo)
	authCompanyGroup.Post("/invite", companyHandler.SendInvite)
	authCompanyGroup.Get("/invites", companyHandler.GetInvites)
	authCompanyGroup.Get("/team-members", companyHandler.GetTeamMembers)
	authCompanyGroup.Post("/invites/:id/resend", companyHandler.ResendInvite)

	profileHandler := handler.NewProfileHandler(c.GetUserRepo(), c.GetDispatcher(), c.GetDiskManager())
	profileGroup := apiGroup.Group("/profile", middleware.Auth(), middleware.RequireCompany())
	profileGroup.Get("/", profileHandler.GetProfile)
	profileGroup.Put("/", profileHandler.UpdateProfile)
	profileGroup.Put("/password", profileHandler.UpdateProfilePassword)
	profileGroup.Put("/avatar", profileHandler.UpdateProfileAvatar)

	// Admin user management routes
	adminUserGroup := apiGroup.Group("/users", middleware.Auth(), middleware.RequireCompany(), middleware.IsAdmin())
	adminUserGroup.Get("/", handler.GetUsers)
	adminUserGroup.Get("/:id", handler.GetUser)
	adminUserGroup.Post("/", handler.CreateCompanyUser)
	adminUserGroup.Put("/:id", handler.UpdateUser)

	notificationSettingsGroup := apiGroup.Group("/notification-settings", middleware.Auth(), middleware.RequireCompany())
	notificationSettingsGroup.Get("/", handler.GetNotificationSettings)
	notificationSettingsGroup.Put("/", handler.UpdateNotificationSettings)

	conversationHandler := handler.NewConversationHandler(c.GetConversationRepo(), c.GetContactRepo(), c.GetDispatcher(), c.GetInboxRepo())
	conversationGroup := apiGroup.Group("/conversations", middleware.Auth(), middleware.RequireCompany())
	conversationGroup.Get("/", conversationHandler.HandleListConversations)
	conversationGroup.Get("/:id", conversationHandler.HandleGetConversation)
}

//
