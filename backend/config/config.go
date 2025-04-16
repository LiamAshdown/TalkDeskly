package config

import (
	"os"
	"strings"
)

type Config struct {
	Port          string
	DatabaseDSN   string
	JwtSecret     string
	BaseURL       string
	FrontendURL   string
	RedisAddr     string
	EmailProvider string
	EmailHost     string
	EmailPort     string
	EmailUsername string
	EmailPassword string
	EmailFrom     string
	Environment   string
	LogLevel      string
	// Internationalization settings
	DefaultLanguage    string
	SupportedLanguages []string
}

// NewConfig creates a new config instance with loaded configuration
func NewConfig() Config {
	return loadConfig()
}

var App Config

func Load() {
	App = loadConfig()
}

// loadConfig loads configuration from environment variables
func loadConfig() Config {
	return Config{
		Port:          getEnv("PORT", "3000"),
		DatabaseDSN:   getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/postgres"),
		JwtSecret:     getEnv("JWT_SECRET", "secret"),
		BaseURL:       getEnv("BASE_URL", "http://localhost:6721"),
		FrontendURL:   getEnv("FRONTEND_URL", "http://localhost:3001"),
		RedisAddr:     getRedisAddr(getEnv("REDIS_URL", "redis:6379")),
		EmailProvider: getEnv("EMAIL_PROVIDER", "gomail"),
		EmailHost:     getEnv("EMAIL_HOST", "mailhog"),
		EmailPort:     getEnv("EMAIL_PORT", "1025"),
		EmailUsername: getEnv("EMAIL_USERNAME", ""),
		EmailPassword: getEnv("EMAIL_PASSWORD", ""),
		EmailFrom:     getEnv("EMAIL_FROM", "noreply@talkdeskly.com"),
		Environment:   getEnv("ENVIRONMENT", "development"),
		LogLevel:      getEnv("LOG_LEVEL", "debug"),
		// Default language setting
		DefaultLanguage:    getEnv("DEFAULT_LANGUAGE", "en"),
		SupportedLanguages: getSupportedLanguages(getEnv("SUPPORTED_LANGUAGES", "en,es,fr")),
	}
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func getRedisAddr(url string) string {
	// Remove redis:// prefix if present
	url = strings.TrimPrefix(url, "redis://")
	// Remove any trailing slashes
	url = strings.TrimSuffix(url, "/")
	return url
}

func getSupportedLanguages(languages string) []string {
	return strings.Split(languages, ",")
}
