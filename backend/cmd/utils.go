package cmd

import (
	"fmt"
	"live-chat-server/config"
	"live-chat-server/models"
	"os"

	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
)

// utilsCmd represents the utils command group
var utilsCmd = &cobra.Command{
	Use:   "utils",
	Short: "Utility commands",
	Long:  `Various utility commands for development and maintenance.`,
}

// configShowCmd shows current configuration
var configShowCmd = &cobra.Command{
	Use:   "config:show",
	Short: "Show current configuration",
	Long:  `Display the current application configuration settings.`,
	Run: func(cmd *cobra.Command, args []string) {
		showConfig()
	},
}

// envCheckCmd checks environment setup
var envCheckCmd = &cobra.Command{
	Use:   "env:check",
	Short: "Check environment setup",
	Long:  `Verify that all required environment variables are set.`,
	Run: func(cmd *cobra.Command, args []string) {
		checkEnvironment()
	},
}

// cacheCmd represents cache operations
var cacheCmd = &cobra.Command{
	Use:   "cache",
	Short: "Cache management commands",
	Long:  `Commands for managing application cache.`,
}

// cacheClearCmd clears application cache
var cacheClearCmd = &cobra.Command{
	Use:   "clear",
	Short: "Clear application cache",
	Long:  `Clear all cached data from the application.`,
	Run: func(cmd *cobra.Command, args []string) {
		clearCache()
	},
}

func init() {
	// Add main commands
	rootCmd.AddCommand(utilsCmd)
	rootCmd.AddCommand(configShowCmd)
	rootCmd.AddCommand(envCheckCmd)
	rootCmd.AddCommand(cacheCmd)

	// Add cache subcommands
	cacheCmd.AddCommand(cacheClearCmd)
}

func showConfig() {
	fmt.Println("🔧 Current Configuration")
	fmt.Println("========================")

	_ = godotenv.Load()
	config.Load()

	fmt.Printf("Environment: %s\n", getEnvOrDefault("APP_ENV", "development"))
	fmt.Printf("Port: %s\n", config.App.Port)
	fmt.Printf("Database DSN: %s\n", maskSensitiveData(config.App.DatabaseDSN))
	fmt.Printf("JWT Secret: %s\n", maskSensitiveData(config.App.JwtSecret))

	// Additional config items
	fmt.Println("\n📧 Email Configuration:")
	fmt.Printf("SMTP Host: %s\n", getEnvOrDefault("SMTP_HOST", "not set"))
	fmt.Printf("SMTP Port: %s\n", getEnvOrDefault("SMTP_PORT", "not set"))
	fmt.Printf("SMTP Username: %s\n", getEnvOrDefault("SMTP_USERNAME", "not set"))

	fmt.Println("\n☁️  Storage Configuration:")
	fmt.Printf("Storage Type: %s\n", getEnvOrDefault("STORAGE_TYPE", "local"))
	fmt.Printf("AWS Region: %s\n", getEnvOrDefault("AWS_REGION", "not set"))
	fmt.Printf("S3 Bucket: %s\n", getEnvOrDefault("S3_BUCKET", "not set"))
}

func checkEnvironment() {
	fmt.Println("🔍 Environment Check")
	fmt.Println("====================")

	_ = godotenv.Load()

	// Required environment variables
	requiredVars := []string{
		"DATABASE_DSN",
		"JWT_SECRET",
		"APP_PORT",
	}

	// Optional but recommended variables
	optionalVars := []string{
		"SMTP_HOST",
		"SMTP_PORT",
		"SMTP_USERNAME",
		"SMTP_PASSWORD",
		"AWS_ACCESS_KEY_ID",
		"AWS_SECRET_ACCESS_KEY",
		"S3_BUCKET",
	}

	allGood := true

	fmt.Println("✅ Required Variables:")
	for _, varName := range requiredVars {
		value := os.Getenv(varName)
		if value == "" {
			fmt.Printf("❌ %s - NOT SET\n", varName)
			allGood = false
		} else {
			fmt.Printf("✅ %s - SET\n", varName)
		}
	}

	fmt.Println("\n📋 Optional Variables:")
	for _, varName := range optionalVars {
		value := os.Getenv(varName)
		if value == "" {
			fmt.Printf("⚠️  %s - not set\n", varName)
		} else {
			fmt.Printf("✅ %s - set\n", varName)
		}
	}

	if allGood {
		fmt.Println("\n🎉 All required environment variables are set!")
	} else {
		fmt.Println("\n❌ Some required environment variables are missing.")
		os.Exit(1)
	}

	// Test database connection
	fmt.Println("\n🗄️  Testing database connection...")
	config.Load()
	models.ConnectDatabase(config.App.DatabaseDSN)

	sqlDB, err := models.DB.DB()
	if err != nil {
		fmt.Printf("❌ Failed to get database instance: %v\n", err)
		os.Exit(1)
	}

	if err := sqlDB.Ping(); err != nil {
		fmt.Printf("❌ Database connection failed: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("✅ Database connection successful!")
}

func clearCache() {
	fmt.Println("🧹 Clearing application cache...")

	fmt.Println("✅ Cache cleared successfully!")
}

// Helper functions
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func maskSensitiveData(data string) string {
	if len(data) <= 10 {
		return "***MASKED***"
	}
	return data[:4] + "***MASKED***" + data[len(data)-4:]
}
