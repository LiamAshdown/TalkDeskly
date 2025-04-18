package router

import (
	"live-chat-server/disk"
	handler "live-chat-server/handlers"
	"live-chat-server/interfaces"
	"live-chat-server/middleware"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/dig"
)

// DIParams contains all the dependencies needed for setting up routes
type DIParams struct {
	dig.In

	App                 *fiber.App
	CompanyHandler      *handler.CompanyHandler
	ContactHandler      *handler.ContactHandler
	ProfileHandler      *handler.ProfileHandler
	InboxHandler        *handler.InboxHandler
	OnboardingHandler   *handler.OnboardingHandler
	ConversationHandler *handler.ConversationHandler
	LanguageHandler     *handler.LanguageHandler
	WebSocketService    interfaces.WebSocketService
	WebSocketHandler    interfaces.WebSocketHandlerInterface
}

// SetupRoutesWithDI sets up the routes using the dependencies provided by Dig
func SetupRoutesWithDI(params DIParams) {
	app := params.App

	// WebSocket route
	app.Get("/ws", params.WebSocketHandler.HandleWebSocket)

	// Static file route
	app.Static("/uploads", disk.GetBasePath())

	apiGroup := app.Group("/api")

	// Language routes
	languageGroup := apiGroup.Group("/language")
	languageGroup.Get("/", params.LanguageHandler.GetSupportedLanguages)
	languageGroup.Post("/", params.LanguageHandler.SetLanguage)

	onboardingGroup := apiGroup.Group("/onboarding")
	onboardingGroup.Post("/user", params.OnboardingHandler.HandleCreateUser)

	onboardingProtectedGroup := onboardingGroup.Group("/", middleware.OnboardingAuth())
	onboardingProtectedGroup.Post("/company", params.OnboardingHandler.HandleCreateCompany)

	inboxGroup := apiGroup.Group("/inbox", middleware.Auth(), middleware.RequireCompany())
	inboxGroup.Post("/", params.InboxHandler.HandleCreateInbox, middleware.IsAdmin())
	inboxGroup.Get("/:id", params.InboxHandler.HandleGetInbox)
	inboxGroup.Put("/:id", params.InboxHandler.HandleUpdateInbox, middleware.IsAdmin())
	inboxGroup.Get("/", params.InboxHandler.HandleListInboxes)
	inboxGroup.Put("/:id/users", params.InboxHandler.HandleUpdateInboxUsers, middleware.IsAdmin())

	contactGroup := apiGroup.Group("/contacts", middleware.Auth(), middleware.RequireCompany())
	contactGroup.Get("/", params.ContactHandler.HandleListContacts)
	contactGroup.Get("/:id", params.ContactHandler.HandleGetContact)
	contactGroup.Post("/", params.ContactHandler.HandleCreateContact)
	contactGroup.Put("/:id", params.ContactHandler.HandleUpdateContact)
	contactGroup.Delete("/:id", params.ContactHandler.HandleDeleteContact)
	contactGroup.Post("/:id/notes", params.ContactHandler.HandleCreateContactNote)
	contactGroup.Get("/:id/notes", params.ContactHandler.HandleListContactNotes)

	companyGroup := apiGroup.Group("/companies")
	companyGroup.Get("/invite/:token", params.CompanyHandler.GetInvite)

	authCompanyGroup := apiGroup.Group("/companies", middleware.Auth(), middleware.RequireCompany())
	authCompanyGroup.Get("/", params.CompanyHandler.GetCompany)
	authCompanyGroup.Put("/", params.CompanyHandler.UpdateCompany)
	authCompanyGroup.Post("/logo", params.CompanyHandler.UploadCompanyLogo)
	authCompanyGroup.Post("/invite", params.CompanyHandler.SendInvite)
	authCompanyGroup.Get("/invites", params.CompanyHandler.GetInvites)
	authCompanyGroup.Get("/team-members", params.CompanyHandler.GetTeamMembers)
	authCompanyGroup.Post("/invites/:id/resend", params.CompanyHandler.ResendInvite)

	profileGroup := apiGroup.Group("/profile", middleware.Auth(), middleware.RequireCompany())
	profileGroup.Get("/", params.ProfileHandler.GetProfile)
	profileGroup.Put("/", params.ProfileHandler.UpdateProfile)
	profileGroup.Put("/password", params.ProfileHandler.UpdateProfilePassword)
	profileGroup.Put("/avatar", params.ProfileHandler.UpdateProfileAvatar)

	// Admin user management routes
	adminUserGroup := apiGroup.Group("/users", middleware.Auth(), middleware.RequireCompany(), middleware.IsAdmin())
	adminUserGroup.Get("/", handler.GetUsers)
	adminUserGroup.Get("/:id", handler.GetUser)
	adminUserGroup.Post("/", handler.CreateCompanyUser)
	adminUserGroup.Put("/:id", handler.UpdateUser)

	notificationSettingsGroup := apiGroup.Group("/notification-settings", middleware.Auth(), middleware.RequireCompany())
	notificationSettingsGroup.Get("/", handler.GetNotificationSettings)
	notificationSettingsGroup.Put("/", handler.UpdateNotificationSettings)

	conversationGroup := apiGroup.Group("/conversations", middleware.Auth(), middleware.RequireCompany())
	conversationGroup.Get("/", params.ConversationHandler.HandleListConversations)
	conversationGroup.Get("/assignable-agents", params.ConversationHandler.HandleGetAssignableAgents)
	conversationGroup.Get("/:id", params.ConversationHandler.HandleGetConversation)
	conversationGroup.Get("/:id/messages", params.ConversationHandler.HandleGetConversationMessages)
	conversationGroup.Post("/:id/assign", params.ConversationHandler.HandleAssignConversation)
	conversationGroup.Post("/:id/close", params.ConversationHandler.HandleCloseConversation)
	conversationGroup.Post("/:id/attachments", params.ConversationHandler.HandleSendMessageAttachment)
}
