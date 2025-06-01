package cmd

import (
	"fmt"
	"live-chat-server/config"
	"live-chat-server/models"

	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
)

// dbCmd represents the db command
var dbCmd = &cobra.Command{
	Use:   "db",
	Short: "Database utility commands",
	Long:  `Database utility commands for checking connection, showing status, and managing the database.`,
}

// dbStatusCmd shows database connection status
var dbStatusCmd = &cobra.Command{
	Use:   "status",
	Short: "Check database connection status",
	Long:  `Check if the database connection is working and show basic database information.`,
	Run: func(cmd *cobra.Command, args []string) {
		checkDatabaseStatus()
	},
}

// dbInfoCmd shows database information
var dbInfoCmd = &cobra.Command{
	Use:   "info",
	Short: "Show database information",
	Long:  `Display detailed information about the database including tables and connection details.`,
	Run: func(cmd *cobra.Command, args []string) {
		showDatabaseInfo()
	},
}

func init() {
	rootCmd.AddCommand(dbCmd)

	// Add subcommands
	dbCmd.AddCommand(dbStatusCmd)
	dbCmd.AddCommand(dbInfoCmd)
}

func checkDatabaseStatus() {
	fmt.Println("🔍 Checking database connection...")

	_ = godotenv.Load()
	config.Load()

	models.ConnectDatabase(config.App.DatabaseDSN)

	// Test the connection
	sqlDB, err := models.DB.DB()
	if err != nil {
		fmt.Printf("❌ Failed to get database instance: %v\n", err)
		return
	}

	if err := sqlDB.Ping(); err != nil {
		fmt.Printf("❌ Database connection failed: %v\n", err)
		return
	}

	fmt.Println("✅ Database connection successful!")

	// Get basic stats
	stats := sqlDB.Stats()
	fmt.Printf("📊 Connection Stats:\n")
	fmt.Printf("   Open Connections: %d\n", stats.OpenConnections)
	fmt.Printf("   In Use: %d\n", stats.InUse)
	fmt.Printf("   Idle: %d\n", stats.Idle)
}

func showDatabaseInfo() {
	fmt.Println("📋 Database Information")
	fmt.Println("======================")

	initDatabase()

	// Get database version
	var version string
	models.DB.Raw("SELECT version()").Scan(&version)
	fmt.Printf("Database: %s\n\n", version)

	// Check tables
	tables := []string{
		"companies", "users", "inboxes", "inbox_emails", "inbox_web_chats",
		"contacts", "notification_settings", "conversations", "messages",
		"contact_notes", "company_invites", "canned_responses", "user_notifications",
	}

	fmt.Println("📋 Tables Status:")
	fmt.Println("================")

	for _, table := range tables {
		if models.DB.Migrator().HasTable(table) {
			var count int64
			models.DB.Table(table).Count(&count)
			fmt.Printf("✅ %-20s - %d records\n", table, count)
		} else {
			fmt.Printf("❌ %-20s - Not found\n", table)
		}
	}
}
