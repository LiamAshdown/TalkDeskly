package cmd

import (
	"fmt"
	"live-chat-server/config"
	"live-chat-server/models"

	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
)

// migrateCmd represents the migrate command
var migrateCmd = &cobra.Command{
	Use:   "migrate",
	Short: "Database migration commands",
	Long: `Run database migrations to create or update database schema.
Similar to Laravel Artisan's migration commands.`,
}

// migrateRunCmd runs pending migrations
var migrateRunCmd = &cobra.Command{
	Use:   "run",
	Short: "Run pending database migrations",
	Long:  `Execute all pending database migrations to update the schema.`,
	Run: func(cmd *cobra.Command, args []string) {
		runMigrations()
	},
}

// migrateStatusCmd shows migration status
var migrateStatusCmd = &cobra.Command{
	Use:   "status",
	Short: "Show migration status",
	Long:  `Display the current migration status and which migrations have been applied.`,
	Run: func(cmd *cobra.Command, args []string) {
		showMigrationStatus()
	},
}

// migrateResetCmd resets all migrations
var migrateResetCmd = &cobra.Command{
	Use:   "reset",
	Short: "Reset all migrations",
	Long:  `Reset all migrations by dropping all tables and re-running migrations.`,
	Run: func(cmd *cobra.Command, args []string) {
		resetMigrations(cmd)
	},
}

func init() {
	rootCmd.AddCommand(migrateCmd)

	// Add subcommands
	migrateCmd.AddCommand(migrateRunCmd)
	migrateCmd.AddCommand(migrateStatusCmd)
	migrateCmd.AddCommand(migrateResetCmd)

	// Add flags
	migrateResetCmd.Flags().BoolP("force", "f", false, "Force reset without confirmation")
}

func initDatabase() {
	_ = godotenv.Load()
	config.Load()
	models.ConnectDatabase(config.App.DatabaseDSN)
}

func runMigrations() {
	fmt.Println("Running database migrations...")

	initDatabase()

	// GORM AutoMigrate will create tables and update schema
	err := models.DB.AutoMigrate(
		&models.Company{},
		&models.User{},
		&models.Inbox{},
		&models.InboxEmail{},
		&models.InboxWebChat{},
		&models.Contact{},
		&models.NotificationSettings{},
		&models.Conversation{},
		&models.Message{},
		&models.ContactNote{},
		&models.CompanyInvite{},
		&models.CannedResponse{},
		&models.UserNotification{},
	)

	if err != nil {
		fmt.Printf("Error running migrations: %v\n", err)
		return
	}

	fmt.Println("✅ Migrations completed successfully!")
}

func showMigrationStatus() {
	fmt.Println("Checking migration status...")

	initDatabase()

	// Check if tables exist
	tables := []string{
		"companies", "users", "inboxes", "inbox_emails", "inbox_web_chats",
		"contacts", "notification_settings", "conversations", "messages",
		"contact_notes", "company_invites", "canned_responses", "user_notifications",
	}

	fmt.Println("\n📋 Migration Status:")
	fmt.Println("==================")

	for _, table := range tables {
		if models.DB.Migrator().HasTable(table) {
			fmt.Printf("✅ %s - Migrated\n", table)
		} else {
			fmt.Printf("❌ %s - Not migrated\n", table)
		}
	}
}

func resetMigrations(cmd *cobra.Command) {
	force, _ := cmd.Flags().GetBool("force")

	if !force {
		fmt.Print("⚠️  This will drop all tables and data. Are you sure? (y/N): ")
		var confirm string
		fmt.Scanln(&confirm)
		if confirm != "y" && confirm != "Y" {
			fmt.Println("Migration reset cancelled.")
			return
		}
	}

	fmt.Println("Resetting database migrations...")

	initDatabase()

	// Drop all tables
	tables := []string{
		"user_notifications", "canned_responses", "company_invites", "contact_notes",
		"messages", "conversations", "notification_settings", "contacts",
		"inbox_web_chats", "inbox_emails", "inboxes", "users", "companies",
	}

	for _, table := range tables {
		if models.DB.Migrator().HasTable(table) {
			err := models.DB.Migrator().DropTable(table)
			if err != nil {
				fmt.Printf("Error dropping table %s: %v\n", table, err)
			} else {
				fmt.Printf("🗑️  Dropped table: %s\n", table)
			}
		}
	}

	// Run migrations again
	fmt.Println("\n🔄 Re-running migrations...")
	runMigrations()
}
