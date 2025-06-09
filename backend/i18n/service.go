package i18n

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"live-chat-server/config"
	"live-chat-server/interfaces"
	"os"
	"path/filepath"
	"sync"
)

// Service implements the I18n interface
type Service struct {
	defaultLanguage    string
	supportedLanguages []string
	translations       map[string]map[string]string
	mutex              sync.RWMutex
}

// NewI18nService creates a new internationalization service
func NewI18nService(cfg config.ConfigManager) (interfaces.I18n, error) {
	service := &Service{
		defaultLanguage:    cfg.GetConfig().DefaultLanguage,
		supportedLanguages: cfg.GetConfig().SupportedLanguages,
		translations:       make(map[string]map[string]string),
	}

	if err := service.loadTranslations(); err != nil {
		return nil, err
	}

	return service, nil
}

// T translates a message key to the specified language
func (s *Service) T(lang, key string, args ...interface{}) string {
	// Use default language if the requested one is not supported
	if !s.isLanguageSupported(lang) {
		lang = s.defaultLanguage
	}

	s.mutex.RLock()
	defer s.mutex.RUnlock()

	// Get translations for language
	translations, exists := s.translations[lang]
	if !exists {
		return key
	}

	// Get translation for key
	translation, exists := translations[key]
	if !exists {
		// Fallback to default language
		if lang != s.defaultLanguage {
			defaultTranslations := s.translations[s.defaultLanguage]
			if defaultTranslation, ok := defaultTranslations[key]; ok {
				translation = defaultTranslation
			} else {
				return key
			}
		} else {
			return key
		}
	}

	// Format the translation with provided arguments
	if len(args) > 0 {
		return fmt.Sprintf(translation, args...)
	}

	return translation
}

// GetDefaultLanguage returns the default language
func (s *Service) GetDefaultLanguage() string {
	return s.defaultLanguage
}

// GetSupportedLanguages returns a list of supported languages
func (s *Service) GetSupportedLanguages() []string {
	return s.supportedLanguages
}

// isLanguageSupported checks if a language is supported
func (s *Service) isLanguageSupported(lang string) bool {
	for _, supported := range s.supportedLanguages {
		if supported == lang {
			return true
		}
	}
	return false
}

// loadTranslations loads all translation files
func (s *Service) loadTranslations() error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	// Path to translation files
	translationsDir := "i18n/translations"

	// Create directory if it doesn't exist
	if _, err := os.Stat(translationsDir); os.IsNotExist(err) {
		if err := os.MkdirAll(translationsDir, 0755); err != nil {
			return fmt.Errorf("failed to create translations directory: %v", err)
		}

		// Create default translations for supported languages
		for _, lang := range s.supportedLanguages {
			err := s.createDefaultTranslationFile(filepath.Join(translationsDir, lang+".json"), lang)
			if err != nil {
				return err
			}
		}
	}

	// Load translations for each supported language
	for _, lang := range s.supportedLanguages {
		filePath := filepath.Join(translationsDir, lang+".json")

		data, err := ioutil.ReadFile(filePath)
		if err != nil {
			return fmt.Errorf("failed to read translation file %s: %v", filePath, err)
		}

		var translations map[string]string
		if err := json.Unmarshal(data, &translations); err != nil {
			return fmt.Errorf("failed to parse translation file %s: %v", filePath, err)
		}

		s.translations[lang] = translations
	}

	return nil
}

// createDefaultTranslationFile creates a default translation file for a language
func (s *Service) createDefaultTranslationFile(filePath, lang string) error {
	// Default translations
	translations := map[string]string{
		"welcome":          "Welcome",
		"login":            "Login",
		"logout":           "Logout",
		"register":         "Register",
		"email":            "Email",
		"password":         "Password",
		"confirm_password": "Confirm Password",
		"submit":           "Submit",
		"cancel":           "Cancel",
		"save":             "Save",
		"delete":           "Delete",
		"edit":             "Edit",
		"error":            "Error",
		"success":          "Success",
	}

	// Spanish translations
	if lang == "es" {
		translations = map[string]string{
			"welcome":          "Bienvenido",
			"login":            "Iniciar Sesión",
			"logout":           "Cerrar Sesión",
			"register":         "Registrarse",
			"email":            "Correo Electrónico",
			"password":         "Contraseña",
			"confirm_password": "Confirmar Contraseña",
			"submit":           "Enviar",
			"cancel":           "Cancelar",
			"save":             "Guardar",
			"delete":           "Eliminar",
			"edit":             "Editar",
			"error":            "Error",
			"success":          "Éxito",
		}
	}

	// French translations
	if lang == "fr" {
		translations = map[string]string{
			"welcome":          "Bienvenue",
			"login":            "Connexion",
			"logout":           "Déconnexion",
			"register":         "S'inscrire",
			"email":            "E-mail",
			"password":         "Mot de passe",
			"confirm_password": "Confirmer le mot de passe",
			"submit":           "Soumettre",
			"cancel":           "Annuler",
			"save":             "Enregistrer",
			"delete":           "Supprimer",
			"edit":             "Modifier",
			"error":            "Erreur",
			"success":          "Succès",
		}
	}

	// Marshal translations to JSON
	data, err := json.MarshalIndent(translations, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal translations for %s: %v", lang, err)
	}

	// Write translations to file
	if err := ioutil.WriteFile(filePath, data, 0644); err != nil {
		return fmt.Errorf("failed to write translations file for %s: %v", lang, err)
	}

	return nil
}
