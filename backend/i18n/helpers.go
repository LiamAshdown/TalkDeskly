package i18n

import (
	"live-chat-server/interfaces"

	"github.com/gofiber/fiber/v2"
)

// GetLanguageFromContext gets the language from Fiber context
func GetLanguageFromContext(c *fiber.Ctx, i18n interfaces.I18n) string {
	lang, ok := c.Locals("language").(string)
	if !ok || lang == "" {
		return i18n.GetDefaultLanguage()
	}
	return lang
}

// Translate helper function to translate a key using language from Fiber context
func Translate(c *fiber.Ctx, i18n interfaces.I18n, key string, args ...interface{}) string {
	lang := GetLanguageFromContext(c, i18n)
	return i18n.T(lang, key, args...)
}
