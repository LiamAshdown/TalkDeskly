package handler

import (
	"live-chat-server/middleware"
	"live-chat-server/models"
	"live-chat-server/utils"

	"github.com/gofiber/fiber/v2"
)

type NotificationSettingsInput struct {
	NewConversation bool `json:"new_conversation" validate:"boolean"`
	NewMessage      bool `json:"new_message" validate:"boolean"`
	Mentions        bool `json:"mentions" validate:"boolean"`
	EmailEnabled    bool `json:"email_enabled" validate:"boolean"`
	BrowserEnabled  bool `json:"browser_enabled" validate:"boolean"`
}

type NotificationSettingsResponse struct {
	ID              string `json:"id"`
	NewConversation bool   `json:"new_conversation"`
	NewMessage      bool   `json:"new_message"`
	Mentions        bool   `json:"mentions"`
	EmailEnabled    bool   `json:"email_enabled"`
	BrowserEnabled  bool   `json:"browser_enabled"`
	CreatedAt       string `json:"created_at"`
	UpdatedAt       string `json:"updated_at"`
}

func ToNotificationSettingsResponse(settings *models.NotificationSettings) NotificationSettingsResponse {
	return NotificationSettingsResponse{
		ID:              settings.ID,
		NewConversation: settings.NewConversation,
		NewMessage:      settings.NewMessage,
		Mentions:        settings.Mentions,
		EmailEnabled:    settings.EmailEnabled,
		BrowserEnabled:  settings.BrowserEnabled,
		CreatedAt:       settings.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:       settings.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// GetNotificationSettings retrieves the user's notification settings
func GetNotificationSettings(c *fiber.Ctx) error {
	user := middleware.GetAuthUser(c)

	var settings models.NotificationSettings
	if err := models.DB.First(&settings, "user_id = ?", user.ID).Error; err != nil {
		settings = models.NotificationSettings{
			UserID:          user.ID,
			NewConversation: true,
			NewMessage:      true,
			Mentions:        true,
			EmailEnabled:    true,
			BrowserEnabled:  false,
		}
		if err := models.DB.Create(&settings).Error; err != nil {
			return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_create_settings", err)
		}
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "settings_found", ToNotificationSettingsResponse(&settings))
}

type UpdateNotificationSettingsInput struct {
	NewConversation bool `json:"new_conversation" validate:"boolean"`
	NewMessage      bool `json:"new_message" validate:"boolean"`
	Mentions        bool `json:"mentions" validate:"boolean"`
	EmailEnabled    bool `json:"email_enabled" validate:"boolean"`
	BrowserEnabled  bool `json:"browser_enabled" validate:"boolean"`
}

func UpdateNotificationSettings(c *fiber.Ctx) error {
	var input UpdateNotificationSettingsInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "bad_request", err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	authUser := middleware.GetAuthUser(c)

	var user models.User
	if err := models.DB.Preload("NotificationSettings").First(&user, "id = ?", authUser.ID).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "user_not_found", err)
	}

	// Create or update notification settings
	if user.NotificationSettings == nil {
		settings := &models.NotificationSettings{
			UserID:          user.ID,
			NewConversation: input.NewConversation,
			NewMessage:      input.NewMessage,
			Mentions:        input.Mentions,
			EmailEnabled:    input.EmailEnabled,
			BrowserEnabled:  input.BrowserEnabled,
		}
		if err := models.DB.Create(settings).Error; err != nil {
			return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_create_settings", err)
		}
		user.NotificationSettings = settings
	} else {
		user.NotificationSettings.NewConversation = input.NewConversation
		user.NotificationSettings.NewMessage = input.NewMessage
		user.NotificationSettings.Mentions = input.Mentions
		user.NotificationSettings.EmailEnabled = input.EmailEnabled
		user.NotificationSettings.BrowserEnabled = input.BrowserEnabled

		if err := models.DB.Save(user.NotificationSettings).Error; err != nil {
			return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_update_settings", err)
		}
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "settings_updated", ToNotificationSettingsResponse(user.NotificationSettings))
}
