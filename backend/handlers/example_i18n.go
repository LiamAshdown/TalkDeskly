package handler

import (
	"live-chat-server/i18n"
	"live-chat-server/interfaces"
	"time"

	"github.com/gofiber/fiber/v2"
)

// Example of how to use i18n in a handler
func ExampleI18n(c *fiber.Ctx, i18nService interfaces.I18n) error {
	// Get the language from the request context
	lang := i18n.GetLanguageFromContext(c, i18nService)

	// Use the i18n service to translate a message
	welcomeMessage := i18nService.T(lang, "welcome")

	// You can also use the helper function
	loginLabel := i18n.Translate(c, i18nService, "login")

	// You can also pass arguments for formatting
	currentTime := time.Now().Format("15:04:05")
	message := i18nService.T(lang, "loading", currentTime)

	return c.JSON(fiber.Map{
		"welcome":    welcomeMessage,
		"loginLabel": loginLabel,
		"message":    message,
		"language":   lang,
	})
}
