package config

import (
	"log"
	"os"
)

type Config struct {
	Port        string
	DatabaseDSN string
	JwtSecret   string
	BaseURL     string
}

var App Config

func Load() {
	App = Config{
		Port:        getEnv("PORT", "3000"),
		DatabaseDSN: getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/postgres"),
		JwtSecret:   getEnv("JWT_SECRET", "secret"),
		BaseURL:     getEnv("BASE_URL", "http://localhost:6721"),
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
