package context

import (
	"live-chat-server/interfaces"

	"github.com/gofiber/fiber/v2"
)

// DefaultLanguageContext is the default implementation of the LanguageContext interface
type DefaultLanguageContext struct {
	i18n            interfaces.I18n
	securityContext interfaces.SecurityContext
}

// NewLanguageContext creates a new instance of DefaultLanguageContext
func NewLanguageContext(i18n interfaces.I18n, securityContext interfaces.SecurityContext) interfaces.LanguageContext {
	return &DefaultLanguageContext{
		i18n:            i18n,
		securityContext: securityContext,
	}
}

// GetLanguage returns the current language from the context
func (lc *DefaultLanguageContext) GetLanguage(c *fiber.Ctx) string {

	if c == nil {
		return lc.i18n.GetDefaultLanguage()
	}

	// Priority 1: Check if user has a language preference
	authUser := lc.securityContext.GetAuthenticatedUser(c)
	if authUser != nil && authUser.User != nil && authUser.User.Language != "" {
		return authUser.User.Language
	}

	// Priority 2: Get language from request context (usually set by a middleware from Accept-Language header)
	lang, ok := c.Locals("language").(string)
	if ok && lang != "" {
		return lang
	}

	// Priority 3: Fall back to default language
	return lc.i18n.GetDefaultLanguage()
}

// T translates a key to the current language
func (lc *DefaultLanguageContext) T(c *fiber.Ctx, key string, args ...interface{}) string {
	return lc.i18n.T(lc.GetLanguage(c), key, args...)
}
