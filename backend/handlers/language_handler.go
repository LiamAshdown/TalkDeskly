package handler

import (
	"live-chat-server/i18n"
	"live-chat-server/interfaces"

	"github.com/gofiber/fiber/v2"
)

// LanguageHandler handles requests related to language settings
type LanguageHandler struct {
	i18n interfaces.I18n
}

// NewLanguageHandler creates a new LanguageHandler
func NewLanguageHandler(i18n interfaces.I18n) *LanguageHandler {
	return &LanguageHandler{
		i18n: i18n,
	}
}

// GetSupportedLanguages returns a list of supported languages
func (h *LanguageHandler) GetSupportedLanguages(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"languages": h.i18n.GetSupportedLanguages(),
		"default":   h.i18n.GetDefaultLanguage(),
		"current":   i18n.GetLanguageFromContext(c, h.i18n),
	})
}

// SetLanguage sets the language in a cookie
func (h *LanguageHandler) SetLanguage(c *fiber.Ctx) error {
	type Request struct {
		Language string `json:"language"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate language
	isSupported := false
	for _, lang := range h.i18n.GetSupportedLanguages() {
		if lang == req.Language {
			isSupported = true
			break
		}
	}

	if !isSupported {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Unsupported language",
		})
	}

	// Set language cookie (1 year expiry)
	cookie := new(fiber.Cookie)
	cookie.Name = "language"
	cookie.Value = req.Language
	cookie.Path = "/"
	cookie.MaxAge = 86400 * 365 // 1 year
	c.Cookie(cookie)

	return c.JSON(fiber.Map{
		"success":  true,
		"language": req.Language,
	})
}

// RegisterLanguageRoutes registers the language routes
func RegisterLanguageRoutes(app *fiber.App, handler *LanguageHandler) {
	api := app.Group("/api")

	// Language endpoints
	language := api.Group("/language")
	language.Get("/", handler.GetSupportedLanguages)
	language.Post("/", handler.SetLanguage)
}
