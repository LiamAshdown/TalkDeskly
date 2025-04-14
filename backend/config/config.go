package config

import (
	"log"
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
}

var App Config

func Load() {
	App = Config{
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
	}

	log.Println("Config loaded")
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
