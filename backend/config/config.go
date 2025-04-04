package config

import (
	"log"
	"os"
)

type Config struct {
	Port        string
	DatabaseDSN string
	JwtSecret   string
}

var App Config

func Load() {
	App = Config{
		Port:        getEnv("PORT", "3000"),
		DatabaseDSN: getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/postgres"),
		JwtSecret:   getEnv("JWT_SECRET", "secret"),
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
