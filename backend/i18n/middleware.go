package i18n

import (
	"live-chat-server/interfaces"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// Middleware creates a middleware that detects the language from request headers
func Middleware(i18n interfaces.I18n) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get language from Accept-Language header
		acceptLanguage := c.Get("Accept-Language")
		lang := parseAcceptLanguage(acceptLanguage, i18n.GetSupportedLanguages(), i18n.GetDefaultLanguage())

		// Store language in context for later use
		c.Locals("language", lang)

		return c.Next()
	}
}

// parseAcceptLanguage parses the Accept-Language header and returns the best matching language
func parseAcceptLanguage(header string, supportedLanguages []string, defaultLanguage string) string {
	if header == "" {
		return defaultLanguage
	}

	// Split Accept-Language by comma
	langs := strings.Split(header, ",")

	// Go through each language in order of preference
	for _, lang := range langs {
		// Remove quality value if present (e.g., en-US;q=0.8)
		langCode := strings.Split(lang, ";")[0]
		langCode = strings.TrimSpace(langCode)

		// Get base language (e.g., en-US -> en)
		baseLang := strings.Split(langCode, "-")[0]

		// Check if the language or its base is supported
		for _, supported := range supportedLanguages {
			if supported == langCode || supported == baseLang {
				return supported
			}
		}
	}

	return defaultLanguage
}
