package router

import (
	"live-chat-server/disk"
	handler "live-chat-server/handlers"
	"live-chat-server/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"go.uber.org/dig"
)

// DIParams contains all the dependencies needed for setting up routes
type DIParams struct {
	dig.In

	App                   *fiber.App
	CompanyHandler        *handler.CompanyHandler
	ContactHandler        *handler.ContactHandler
	ProfileHandler        *handler.ProfileHandler
	InboxHandler          *handler.InboxHandler
	OnboardingHandler     *handler.OnboardingHandler
	ConversationHandler   *handler.ConversationHandler
	LanguageHandler       *handler.LanguageHandler
	WebSocketHandler      *handler.WebSocketHandler
	PublicHandler         *handler.PublicHandler
	AuthHandler           *handler.AuthHandler
	UserHandler           *handler.UserHandler
	CannedResponseHandler *handler.CannedResponseHandler
	NotificationHandler   *handler.NotificationHandler
}

// SetupRoutesWithDI sets up the routes using the dependencies provided by Dig
func SetupRoutesWithDI(params DIParams) {
	app := params.App

	// Static file route
	app.Static("/uploads", disk.GetBasePath())

	apiGroup := app.Group("/api")

	authGroup := apiGroup.Group("/auth")
	authGroup.Post("/login", params.AuthHandler.Login)

	wsGroup := app.Group("/ws")

	wsGroup.Use("/agents/:user_id", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return c.Status(fiber.StatusUpgradeRequired).SendString("Upgrade to WebSocket required")
	})

	wsGroup.Get("/agents/:user_id", websocket.New(func(c *websocket.Conn) {
		params.WebSocketHandler.HandleAgentWebSocket(c)
	}))

	wsGroup.Use("/contacts/:contact_id", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return c.Status(fiber.StatusUpgradeRequired).SendString("Upgrade to WebSocket required")
	})

	wsGroup.Get("/contacts", websocket.New(func(c *websocket.Conn) {
		params.WebSocketHandler.HandleContactWebSocket(c)
	}))

	// Language routes
	languageGroup := apiGroup.Group("/language")
	languageGroup.Get("/", params.LanguageHandler.GetSupportedLanguages)
	languageGroup.Post("/", params.LanguageHandler.SetLanguage)

	// Public routes (Used by the chat bubble)
	publicGroup := apiGroup.Group("/public")
	publicGroup.Get("/inbox/:id", params.PublicHandler.HandleGetInboxDetails)
	publicGroup.Get("/conversations/:id/:contact_id", params.PublicHandler.HandleGetConversationDetails)

	onboardingGroup := apiGroup.Group("/onboarding")
	onboardingGroup.Post("/user", params.OnboardingHandler.HandleCreateUser)

	onboardingProtectedGroup := onboardingGroup.Group("/", middleware.OnboardingAuth())
	onboardingProtectedGroup.Post("/company", params.OnboardingHandler.HandleCreateCompany)

	inboxGroup := apiGroup.Group("/inbox", middleware.Auth(), middleware.RequireCompany())
	inboxGroup.Post("/", middleware.IsAdmin(), params.InboxHandler.HandleCreateInbox)
	inboxGroup.Get("/:id", params.InboxHandler.HandleGetInbox)
	inboxGroup.Put("/:id", middleware.IsAdmin(), params.InboxHandler.HandleUpdateInbox)
	inboxGroup.Get("/", params.InboxHandler.HandleListInboxes)
	inboxGroup.Put("/:id/users", middleware.IsAdmin(), params.InboxHandler.HandleUpdateInboxUsers)

	contactGroup := apiGroup.Group("/contacts", middleware.Auth(), middleware.RequireCompany())
	contactGroup.Get("/", params.ContactHandler.HandleListContacts)
	contactGroup.Get("/:id", params.ContactHandler.HandleGetContact)
	contactGroup.Post("/", params.ContactHandler.HandleCreateContact)
	contactGroup.Put("/:id", params.ContactHandler.HandleUpdateContact)
	contactGroup.Delete("/:id", params.ContactHandler.HandleDeleteContact)
	contactGroup.Post("/:id/notes", params.ContactHandler.HandleCreateContactNote)
	contactGroup.Get("/:id/notes", params.ContactHandler.HandleListContactNotes)
	contactGroup.Get("/:id/conversations", params.ContactHandler.HandleGetContactConversations)

	companyGroup := apiGroup.Group("/companies")
	companyGroup.Get("/invite/:token", params.CompanyHandler.GetInvite)

	authCompanyGroup := apiGroup.Group("/companies", middleware.Auth(), middleware.RequireCompany())
	authCompanyGroup.Get("/", params.CompanyHandler.GetCompany)
	authCompanyGroup.Put("/", params.CompanyHandler.UpdateCompany)
	authCompanyGroup.Post("/logo", params.CompanyHandler.UploadCompanyLogo)
	authCompanyGroup.Post("/invite", params.CompanyHandler.SendInvite)
	authCompanyGroup.Get("/invites", params.CompanyHandler.GetInvites)
	authCompanyGroup.Get("/team-members", params.CompanyHandler.GetTeamMembers)
	authCompanyGroup.Post("/team-members", params.CompanyHandler.CreateTeamMember)
	authCompanyGroup.Post("/invites/:id/resend", params.CompanyHandler.ResendInvite)

	profileGroup := apiGroup.Group("/profile", middleware.Auth(), middleware.RequireCompany())
	profileGroup.Get("/", params.ProfileHandler.GetProfile)
	profileGroup.Put("/", params.ProfileHandler.UpdateProfile)
	profileGroup.Put("/password", params.ProfileHandler.UpdateProfilePassword)
	profileGroup.Put("/avatar", params.ProfileHandler.UpdateProfileAvatar)

	// Admin user management routes
	adminUserGroup := apiGroup.Group("/users", middleware.Auth(), middleware.RequireCompany(), middleware.IsAdmin())
	adminUserGroup.Get("/", params.UserHandler.GetUsers)
	adminUserGroup.Get("/:id", params.UserHandler.GetUser)
	adminUserGroup.Post("/", params.UserHandler.CreateCompanyUser)
	adminUserGroup.Put("/:id", params.UserHandler.UpdateUser)

	notificationSettingsGroup := apiGroup.Group("/notification-settings", middleware.Auth(), middleware.RequireCompany())
	notificationSettingsGroup.Get("/", handler.GetNotificationSettings)
	notificationSettingsGroup.Put("/", handler.UpdateNotificationSettings)

	// Notification routes
	notificationGroup := apiGroup.Group("/notifications", middleware.Auth(), middleware.RequireCompany())
	notificationGroup.Get("/", params.NotificationHandler.GetNotifications)
	notificationGroup.Get("/unread-count", params.NotificationHandler.GetUnreadCount)
	notificationGroup.Get("/:id", params.NotificationHandler.GetNotification)
	notificationGroup.Put("/mark-as-read", params.NotificationHandler.MarkAsRead)
	notificationGroup.Put("/mark-all-as-read", params.NotificationHandler.MarkAllAsRead)
	notificationGroup.Delete("/:id", params.NotificationHandler.DeleteNotification)
	notificationGroup.Delete("/", params.NotificationHandler.DeleteAllNotifications)

	conversationGroup := apiGroup.Group("/conversations", middleware.Auth(), middleware.RequireCompany())
	conversationGroup.Get("/", params.ConversationHandler.HandleListConversations)
	conversationGroup.Get("/:id/assignable-agents", params.ConversationHandler.HandleGetAssignableAgents)
	conversationGroup.Get("/:id", params.ConversationHandler.HandleGetConversation)
	conversationGroup.Get("/:id/messages", params.ConversationHandler.HandleGetConversationMessages)
	conversationGroup.Post("/:id/assign", params.ConversationHandler.HandleAssignConversation)
	conversationGroup.Post("/:id/close", params.ConversationHandler.HandleCloseConversation)
	conversationGroup.Post("/:id/attachments", params.ConversationHandler.HandleSendMessageAttachment)

	cannedResponseGroup := apiGroup.Group("/canned-responses", middleware.Auth(), middleware.RequireCompany())
	cannedResponseGroup.Get("/", params.CannedResponseHandler.HandleListCannedResponses)
	cannedResponseGroup.Post("/", params.CannedResponseHandler.HandleCreateCannedResponse)
	cannedResponseGroup.Put("/:id", params.CannedResponseHandler.HandleUpdateCannedResponse)
	cannedResponseGroup.Delete("/:id", params.CannedResponseHandler.HandleDeleteCannedResponse)
}
