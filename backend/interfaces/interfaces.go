package interfaces

import (
	"github.com/gofiber/fiber/v2"
)

// LanguageContext provides language-related functionality
type LanguageContext interface {
	// GetLanguage returns the current language from the context
	GetLanguage(c *fiber.Ctx) string

	// Translate translates a key to the current language
	T(c *fiber.Ctx, key string) string
}
