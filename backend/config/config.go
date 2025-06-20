package config

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strings"
)

// Default configuration values
const (
	DefaultPort               = "3000"
	DefaultDatabaseDSN        = "postgres://postgres:postgres@localhost:5432/postgres"
	DefaultJwtSecret          = "secret"
	DefaultBaseURL            = "http://localhost:6721"
	DefaultFrontendURL        = "http://localhost:3001"
	DefaultRedisURL           = "redis:6379"
	DefaultEmailProvider      = "gomail"
	DefaultEmailHost          = "mailhog"
	DefaultEmailPort          = "1025"
	DefaultEmailFrom          = "noreply@talkdeskly.com"
	DefaultEnvironment        = "development"
	DefaultLogLevel           = "debug"
	DefaultLanguage           = "en"
	DefaultSupportedLanguages = "en"
	DefaultApplicationName    = "TalkDeskly"
	ConfigFileName            = "storage/config.json"
)

// Config represents the application configuration structure
type Config struct {
	// Server Configuration
	Port        string
	BaseURL     string
	FrontendURL string
	Environment string
	LogLevel    string

	// Database Configuration
	DatabaseDSN string
	RedisAddr   string

	// Security Configuration
	JwtSecret string

	// Email Configuration
	EmailProvider string
	EmailHost     string
	EmailPort     string
	EmailUsername string
	EmailPassword string
	EmailFrom     string

	// Internationalization Configuration
	DefaultLanguage    string
	SupportedLanguages []string

	// Application Configuration
	ApplicationName    string
	EnableRegistration string
	Version            string
}

// ConfigManager interface defines the contract for configuration management
type ConfigManager interface {
	GetConfig() Config
	Load()
	Reload()
	IsRegistrationEnabled() bool

	// Configuration setters
	SetPort(port string) error
	SetBaseURL(url string) error
	SetFrontendURL(url string) error
	SetEnvironment(env string) error
	SetLogLevel(level string) error
	SetDatabaseDSN(dsn string) error
	SetRedisAddr(addr string) error
	SetJwtSecret(secret string) error
	SetEmailProvider(provider string) error
	SetEmailHost(host string) error
	SetEmailPort(port string) error
	SetEmailUsername(username string) error
	SetEmailPassword(password string) error
	SetEmailFrom(from string) error
	SetDefaultLanguage(lang string) error
	SetSupportedLanguages(languages []string) error
	SetApplicationName(name string) error
	SetEnableRegistration(enable string) error
	SetVersion(version string) error
	SaveCurrentConfig() error
}

// JSONConfig represents the JSON configuration file structure
// Uses pointers to detect which values are explicitly set
type JSONConfig struct {
	// Server Configuration
	Port        *string `json:"port,omitempty"`
	BaseURL     *string `json:"base_url,omitempty"`
	FrontendURL *string `json:"frontend_url,omitempty"`
	Environment *string `json:"environment,omitempty"`
	LogLevel    *string `json:"log_level,omitempty"`

	// Database Configuration
	DatabaseDSN *string `json:"database_dsn,omitempty"`
	RedisAddr   *string `json:"redis_addr,omitempty"`

	// Security Configuration
	JwtSecret *string `json:"jwt_secret,omitempty"`

	// Email Configuration
	EmailProvider *string `json:"email_provider,omitempty"`
	EmailHost     *string `json:"email_host,omitempty"`
	EmailPort     *string `json:"email_port,omitempty"`
	EmailUsername *string `json:"email_username,omitempty"`
	EmailPassword *string `json:"email_password,omitempty"`
	EmailFrom     *string `json:"email_from,omitempty"`

	// Internationalization Configuration
	DefaultLanguage    *string `json:"default_language,omitempty"`
	SupportedLanguages *string `json:"supported_languages,omitempty"`

	// Application Configuration
	ApplicationName    *string `json:"application_name,omitempty"`
	EnableRegistration *string `json:"enable_registration,omitempty"`
	Version            *string `json:"version,omitempty"`
}

// ConfigManagerImpl handles all configuration operations
type ConfigManagerImpl struct {
	config Config
}

// NewConfigManager creates a new ConfigManager instance with loaded configuration
func NewConfigManager() ConfigManager {
	cm := &ConfigManagerImpl{}
	cm.Load()
	return cm
}

// GetConfig returns the current configuration
func (cm *ConfigManagerImpl) GetConfig() Config {
	return cm.config
}

// Load initializes the configuration
func (cm *ConfigManagerImpl) Load() {
	cm.config = cm.loadConfig()
}

// Reload reloads the configuration from files
func (cm *ConfigManagerImpl) Reload() {
	cm.Load()
	log.Println("Configuration reloaded")
}

// loadConfig loads configuration with priority: defaults -> env vars -> JSON file
func (cm *ConfigManagerImpl) loadConfig() Config {
	// Step 1: Load base configuration from environment variables
	config := cm.loadFromEnv()

	// Step 2: Try to override with JSON configuration if available
	if jsonConfig := cm.loadFromJSON(ConfigFileName); jsonConfig != nil {
		config = cm.mergeJSONConfig(config, jsonConfig)
		log.Printf("Configuration overridden with %s", ConfigFileName)
	}

	return config
}

// loadFromEnv loads configuration from environment variables with fallback to defaults
func (cm *ConfigManagerImpl) loadFromEnv() Config {
	return Config{
		// Server Configuration
		Port:        getEnv("PORT", DefaultPort),
		BaseURL:     getEnv("BASE_URL", DefaultBaseURL),
		FrontendURL: getEnv("FRONTEND_URL", DefaultFrontendURL),
		Environment: getEnv("ENVIRONMENT", DefaultEnvironment),
		LogLevel:    getEnv("LOG_LEVEL", DefaultLogLevel),

		// Database Configuration
		DatabaseDSN: getEnv("DATABASE_URL", DefaultDatabaseDSN),
		RedisAddr:   getRedisAddr(getEnv("REDIS_URL", DefaultRedisURL)),

		// Security Configuration
		JwtSecret: getEnv("JWT_SECRET", DefaultJwtSecret),

		// Email Configuration
		EmailProvider: getEnv("EMAIL_PROVIDER", DefaultEmailProvider),
		EmailHost:     getEnv("EMAIL_HOST", DefaultEmailHost),
		EmailPort:     getEnv("EMAIL_PORT", DefaultEmailPort),
		EmailUsername: getEnv("EMAIL_USERNAME", ""),
		EmailPassword: getEnv("EMAIL_PASSWORD", ""),
		EmailFrom:     getEnv("EMAIL_FROM", DefaultEmailFrom),

		// Internationalization Configuration
		DefaultLanguage:    getEnv("DEFAULT_LANGUAGE", DefaultLanguage),
		SupportedLanguages: getSupportedLanguages(getEnv("SUPPORTED_LANGUAGES", DefaultSupportedLanguages)),

		// Application Configuration
		ApplicationName:    getEnv("APPLICATION_NAME", DefaultApplicationName),
		EnableRegistration: getEnv("ENABLE_REGISTRATION", "false"),
		Version:            getVersionWithFallback(),
	}
}

// loadFromJSON attempts to load configuration from a JSON file
// Returns nil if file doesn't exist or cannot be parsed
func (cm *ConfigManagerImpl) loadFromJSON(filename string) *JSONConfig {
	file, err := os.Open(filename)
	if err != nil {
		// File doesn't exist or cannot be opened - this is not an error
		return nil
	}
	defer file.Close()

	var jsonConfig JSONConfig
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&jsonConfig); err != nil {
		log.Printf("Warning: Error parsing JSON config file %s: %v", filename, err)
		return nil
	}

	return &jsonConfig
}

// mergeJSONConfig merges JSON configuration values over the base configuration
// Only non-nil JSON values will override the base configuration
func (cm *ConfigManagerImpl) mergeJSONConfig(base Config, jsonConfig *JSONConfig) Config {
	// Server Configuration
	if jsonConfig.Port != nil {
		base.Port = *jsonConfig.Port
	}
	if jsonConfig.BaseURL != nil {
		base.BaseURL = *jsonConfig.BaseURL
	}
	if jsonConfig.FrontendURL != nil {
		base.FrontendURL = *jsonConfig.FrontendURL
	}
	if jsonConfig.Environment != nil {
		base.Environment = *jsonConfig.Environment
	}
	if jsonConfig.LogLevel != nil {
		base.LogLevel = *jsonConfig.LogLevel
	}

	// Database Configuration
	if jsonConfig.DatabaseDSN != nil {
		base.DatabaseDSN = *jsonConfig.DatabaseDSN
	}
	if jsonConfig.RedisAddr != nil {
		base.RedisAddr = getRedisAddr(*jsonConfig.RedisAddr)
	}

	// Security Configuration
	if jsonConfig.JwtSecret != nil {
		base.JwtSecret = *jsonConfig.JwtSecret
	}

	// Email Configuration
	if jsonConfig.EmailProvider != nil {
		base.EmailProvider = *jsonConfig.EmailProvider
	}
	if jsonConfig.EmailHost != nil {
		base.EmailHost = *jsonConfig.EmailHost
	}
	if jsonConfig.EmailPort != nil {
		base.EmailPort = *jsonConfig.EmailPort
	}
	if jsonConfig.EmailUsername != nil {
		base.EmailUsername = *jsonConfig.EmailUsername
	}
	if jsonConfig.EmailPassword != nil {
		base.EmailPassword = *jsonConfig.EmailPassword
	}
	if jsonConfig.EmailFrom != nil {
		base.EmailFrom = *jsonConfig.EmailFrom
	}

	// Internationalization Configuration
	if jsonConfig.DefaultLanguage != nil {
		base.DefaultLanguage = *jsonConfig.DefaultLanguage
	}
	if jsonConfig.SupportedLanguages != nil {
		base.SupportedLanguages = getSupportedLanguages(*jsonConfig.SupportedLanguages)
	}

	// Application Configuration
	if jsonConfig.ApplicationName != nil {
		base.ApplicationName = *jsonConfig.ApplicationName
	}

	if jsonConfig.EnableRegistration != nil {
		base.EnableRegistration = *jsonConfig.EnableRegistration
	}

	if jsonConfig.Version != nil {
		base.Version = *jsonConfig.Version
	}

	return base
}

// Configuration Setters - These functions update the JSON config file and reload configuration

// SetPort updates the server port in JSON config and reloads
func (cm *ConfigManagerImpl) SetPort(port string) error {
	return cm.setConfigValue("port", port)
}

// SetBaseURL updates the base URL in JSON config and reloads
func (cm *ConfigManagerImpl) SetBaseURL(url string) error {
	return cm.setConfigValue("base_url", url)
}

// SetFrontendURL updates the frontend URL in JSON config and reloads
func (cm *ConfigManagerImpl) SetFrontendURL(url string) error {
	return cm.setConfigValue("frontend_url", url)
}

// SetEnvironment updates the environment in JSON config and reloads
func (cm *ConfigManagerImpl) SetEnvironment(env string) error {
	return cm.setConfigValue("environment", env)
}

// SetLogLevel updates the log level in JSON config and reloads
func (cm *ConfigManagerImpl) SetLogLevel(level string) error {
	return cm.setConfigValue("log_level", level)
}

// SetDatabaseDSN updates the database DSN in JSON config and reloads
func (cm *ConfigManagerImpl) SetDatabaseDSN(dsn string) error {
	return cm.setConfigValue("database_dsn", dsn)
}

// SetRedisAddr updates the Redis address in JSON config and reloads
func (cm *ConfigManagerImpl) SetRedisAddr(addr string) error {
	return cm.setConfigValue("redis_addr", addr)
}

// SetJwtSecret updates the JWT secret in JSON config and reloads
func (cm *ConfigManagerImpl) SetJwtSecret(secret string) error {
	return cm.setConfigValue("jwt_secret", secret)
}

// SetEmailProvider updates the email provider in JSON config and reloads
func (cm *ConfigManagerImpl) SetEmailProvider(provider string) error {
	return cm.setConfigValue("email_provider", provider)
}

// SetEmailHost updates the email host in JSON config and reloads
func (cm *ConfigManagerImpl) SetEmailHost(host string) error {
	return cm.setConfigValue("email_host", host)
}

// SetEmailPort updates the email port in JSON config and reloads
func (cm *ConfigManagerImpl) SetEmailPort(port string) error {
	return cm.setConfigValue("email_port", port)
}

// SetEmailUsername updates the email username in JSON config and reloads
func (cm *ConfigManagerImpl) SetEmailUsername(username string) error {
	return cm.setConfigValue("email_username", username)
}

// SetEmailPassword updates the email password in JSON config and reloads
func (cm *ConfigManagerImpl) SetEmailPassword(password string) error {
	return cm.setConfigValue("email_password", password)
}

// SetEmailFrom updates the email from address in JSON config and reloads
func (cm *ConfigManagerImpl) SetEmailFrom(from string) error {
	return cm.setConfigValue("email_from", from)
}

// SetDefaultLanguage updates the default language in JSON config and reloads
func (cm *ConfigManagerImpl) SetDefaultLanguage(lang string) error {
	return cm.setConfigValue("default_language", lang)
}

// SetSupportedLanguages updates the supported languages in JSON config and reloads
func (cm *ConfigManagerImpl) SetSupportedLanguages(languages []string) error {
	return cm.setConfigValue("supported_languages", strings.Join(languages, ","))
}

// SetApplicationName updates the application name in JSON config and reloads
func (cm *ConfigManagerImpl) SetApplicationName(name string) error {
	return cm.setConfigValue("application_name", name)
}

// SetEnableRegistration updates the enable registration in JSON config and reloads
func (cm *ConfigManagerImpl) SetEnableRegistration(enable string) error {
	return cm.setConfigValue("enable_registration", enable)
}

// SetVersion updates the version in JSON config and reloads
func (cm *ConfigManagerImpl) SetVersion(version string) error {
	return cm.setConfigValue("version", version)
}

// IsRegistrationEnabled checks if registration is enabled
func (cm *ConfigManagerImpl) IsRegistrationEnabled() bool {
	return cm.config.EnableRegistration == "true"
}

// SaveCurrentConfig saves the current in-memory configuration to JSON file
func (cm *ConfigManagerImpl) SaveCurrentConfig() error {
	return cm.saveConfigToJSON(cm.config)
}

// Internal setter functions

// setConfigValue updates a single configuration value in the JSON file
func (cm *ConfigManagerImpl) setConfigValue(key, value string) error {
	// Load existing JSON config or create new one
	jsonConfig := cm.loadFromJSON(ConfigFileName)
	if jsonConfig == nil {
		jsonConfig = &JSONConfig{}
	}

	// Update the specific field
	switch key {
	case "port":
		jsonConfig.Port = &value
	case "base_url":
		jsonConfig.BaseURL = &value
	case "frontend_url":
		jsonConfig.FrontendURL = &value
	case "environment":
		jsonConfig.Environment = &value
	case "log_level":
		jsonConfig.LogLevel = &value
	case "database_dsn":
		jsonConfig.DatabaseDSN = &value
	case "redis_addr":
		jsonConfig.RedisAddr = &value
	case "jwt_secret":
		jsonConfig.JwtSecret = &value
	case "email_provider":
		jsonConfig.EmailProvider = &value
	case "email_host":
		jsonConfig.EmailHost = &value
	case "email_port":
		jsonConfig.EmailPort = &value
	case "email_username":
		jsonConfig.EmailUsername = &value
	case "email_password":
		jsonConfig.EmailPassword = &value
	case "email_from":
		jsonConfig.EmailFrom = &value
	case "default_language":
		jsonConfig.DefaultLanguage = &value
	case "supported_languages":
		jsonConfig.SupportedLanguages = &value
	case "application_name":
		jsonConfig.ApplicationName = &value
	case "enable_registration":
		jsonConfig.EnableRegistration = &value
	case "version":
		jsonConfig.Version = &value
	default:
		return os.ErrInvalid
	}

	// Save to file
	if err := cm.saveJSONConfigToFile(jsonConfig); err != nil {
		return err
	}

	// Reload configuration
	cm.Reload()
	return nil
}

// saveConfigToJSON converts the current Config to JSONConfig and saves it
func (cm *ConfigManagerImpl) saveConfigToJSON(config Config) error {
	jsonConfig := &JSONConfig{
		Port:               &config.Port,
		BaseURL:            &config.BaseURL,
		FrontendURL:        &config.FrontendURL,
		Environment:        &config.Environment,
		LogLevel:           &config.LogLevel,
		DatabaseDSN:        &config.DatabaseDSN,
		RedisAddr:          &config.RedisAddr,
		JwtSecret:          &config.JwtSecret,
		EmailProvider:      &config.EmailProvider,
		EmailHost:          &config.EmailHost,
		EmailPort:          &config.EmailPort,
		EmailUsername:      &config.EmailUsername,
		EmailPassword:      &config.EmailPassword,
		EmailFrom:          &config.EmailFrom,
		DefaultLanguage:    &config.DefaultLanguage,
		ApplicationName:    &config.ApplicationName,
		EnableRegistration: &config.EnableRegistration,
		Version:            &config.Version,
	}

	// Convert supported languages back to comma-separated string
	supportedLangs := strings.Join(config.SupportedLanguages, ",")
	jsonConfig.SupportedLanguages = &supportedLangs

	return cm.saveJSONConfigToFile(jsonConfig)
}

// saveJSONConfigToFile writes JSONConfig to the config file
func (cm *ConfigManagerImpl) saveJSONConfigToFile(jsonConfig *JSONConfig) error {
	// Ensure the directory exists
	if err := os.MkdirAll(filepath.Dir(ConfigFileName), 0755); err != nil {
		return err
	}

	file, err := os.Create(ConfigFileName)
	if err != nil {
		return err
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ") // Pretty print with 2-space indentation
	if err := encoder.Encode(jsonConfig); err != nil {
		return err
	}

	log.Printf("Configuration saved to %s", ConfigFileName)
	return nil
}

// Utility functions

// getEnv retrieves environment variable with fallback to default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getRedisAddr processes Redis URL by removing protocol prefix and trailing slashes
func getRedisAddr(url string) string {
	// Remove redis:// prefix if present
	url = strings.TrimPrefix(url, "redis://")
	// Remove any trailing slashes
	url = strings.TrimSuffix(url, "/")
	return url
}

// getSupportedLanguages parses comma-separated language list
func getSupportedLanguages(languages string) []string {
	return strings.Split(languages, ",")
}

// getVersionFromFile reads the version from version.txt file
// Returns empty string if file doesn't exist or can't be read
func getVersionFromFile() string {
	content, err := ioutil.ReadFile("version.txt")
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(content))
}

// getVersionWithFallback reads version with priority: version.txt -> env var -> default
func getVersionWithFallback() string {
	// First try to read from version.txt file
	if version := getVersionFromFile(); version != "" {
		return version
	}

	// Fallback to environment variable
	if version := getEnv("VERSION", ""); version != "" {
		return version
	}

	// Final fallback to default
	return "0.0.1"
}

// Global configuration instance for backward compatibility
var App Config

// Backward compatibility functions - these maintain the old API while using the new structure
var defaultConfigManager ConfigManager

func init() {
	defaultConfigManager = NewConfigManager()
	App = defaultConfigManager.GetConfig()
}

// NewConfig creates a new config instance with loaded configuration
func NewConfig() Config {
	return NewConfigManager().GetConfig()
}

// Load initializes the global configuration
func Load() {
	defaultConfigManager = NewConfigManager()
	App = defaultConfigManager.GetConfig()
}

// Reload reloads the global configuration from files
func Reload() {
	defaultConfigManager.Reload()
	App = defaultConfigManager.GetConfig()
	log.Println("Configuration reloaded")
}

func IsRegistrationEnabled() bool {
	return defaultConfigManager.IsRegistrationEnabled()
}
