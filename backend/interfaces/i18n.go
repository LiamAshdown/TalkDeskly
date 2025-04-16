package interfaces

// I18n defines the interface for the internationalization service
type I18n interface {
	// T translates a message key to the specified language
	T(lang, key string, args ...interface{}) string

	// GetDefaultLanguage returns the default language
	GetDefaultLanguage() string

	// GetSupportedLanguages returns a list of supported languages
	GetSupportedLanguages() []string
}
