package cmd

import (
	"fmt"
	"live-chat-server/config"
	"live-chat-server/models"

	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
)

// resetCmd represents the reset command group
var resetCmd = &cobra.Command{
	Use:   "reset",
	Short: "Database reset commands",
	Long:  `Reset the database by dropping all data and optionally re-seeding.`,
}

// resetDbCmd resets the entire database
var resetDbCmd = &cobra.Command{
	Use:   "db",
	Short: "Reset the entire database",
	Long:  `Drop all tables, run migrations, and optionally seed with fresh data.`,
	Run: func(cmd *cobra.Command, args []string) {
		resetDatabase(cmd)
	},
}

// resetDataCmd resets only the data (keeps schema)
var resetDataCmd = &cobra.Command{
	Use:   "data",
	Short: "Reset only the data",
	Long:  `Clear all data from tables but keep the database schema.`,
	Run: func(cmd *cobra.Command, args []string) {
		resetDataOnly(cmd)
	},
}

func init() {
	rootCmd.AddCommand(resetCmd)

	// Add subcommands
	resetCmd.AddCommand(resetDbCmd)
	resetCmd.AddCommand(resetDataCmd)

	// Add flags
	resetDbCmd.Flags().BoolP("force", "f", false, "Force reset without confirmation")
	resetDbCmd.Flags().BoolP("seed", "s", false, "Seed database after reset")
	resetDbCmd.Flags().IntP("count", "c", 10, "Number of records to seed")

	resetDataCmd.Flags().BoolP("force", "f", false, "Force reset without confirmation")
	resetDataCmd.Flags().BoolP("seed", "s", false, "Seed database after reset")
	resetDataCmd.Flags().IntP("count", "c", 10, "Number of records to seed")
}

func resetDatabase(cmd *cobra.Command) {
	force, _ := cmd.Flags().GetBool("force")
	seed, _ := cmd.Flags().GetBool("seed")
	count, _ := cmd.Flags().GetInt("count")

	if !force {
		fmt.Print("⚠️  This will DROP ALL TABLES and DATA. Are you sure? (y/N): ")
		var confirm string
		fmt.Scanln(&confirm)
		if confirm != "y" && confirm != "Y" {
			fmt.Println("Database reset cancelled.")
			return
		}
	}

	fmt.Println("🗑️  Resetting database...")

	initSeedDatabase()

	// Drop all tables in reverse dependency order
	tables := []string{
		"user_notifications", "canned_responses", "company_invites", "contact_notes",
		"messages", "conversations", "notification_settings", "contacts",
		"inbox_web_chats", "inbox_emails", "inboxes", "inbox_users", "users", "companies",
	}

	fmt.Println("Dropping tables...")
	for _, table := range tables {
		if models.DB.Migrator().HasTable(table) {
			err := models.DB.Migrator().DropTable(table)
			if err != nil {
				fmt.Printf("Error dropping table %s: %v\n", table, err)
			} else {
				fmt.Printf("  🗑️  Dropped table: %s\n", table)
			}
		}
	}

	// Run migrations
	fmt.Println("\n🔄 Running migrations...")
	runMigrations()

	// Optionally seed data
	if seed {
		fmt.Printf("\n🌱 Seeding database with %d records per entity...\n", count)
		seedWithCount(count)
	}

	fmt.Println("\n✅ Database reset complete!")
}

func resetDataOnly(cmd *cobra.Command) {
	force, _ := cmd.Flags().GetBool("force")
	seed, _ := cmd.Flags().GetBool("seed")
	count, _ := cmd.Flags().GetInt("count")

	if !force {
		fmt.Print("⚠️  This will DELETE ALL DATA (keeps tables). Are you sure? (y/N): ")
		var confirm string
		fmt.Scanln(&confirm)
		if confirm != "y" && confirm != "Y" {
			fmt.Println("Data reset cancelled.")
			return
		}
	}

	fmt.Println("🧹 Clearing all data...")

	initSeedDatabase()

	// Clear data in reverse dependency order (children first, then parents)
	clearSeedDataSilent()

	// Optionally seed data
	if seed {
		fmt.Printf("\n🌱 Seeding database with %d records per entity...\n", count)
		seedWithCount(count)
	}

	fmt.Println("\n✅ Data reset complete!")
}

func seedWithCount(count int) {
	// Run seeders in dependency order
	fmt.Println("📊 Seeding companies...")
	createSampleCompanies(count)

	fmt.Println("👥 Seeding users...")
	createSampleUsers(count)

	fmt.Println("📮 Seeding inboxes...")
	createSampleInboxes(count)

	fmt.Println("👤 Seeding contacts...")
	createSampleContacts(count)

	fmt.Println("💬 Seeding conversations...")
	createSampleConversations(count)
}

func clearSeedDataSilent() {
	_ = godotenv.Load()
	config.Load()
	models.ConnectDatabase(config.App.DatabaseDSN)

	// Clear in reverse dependency order (children first, then parents)
	models.DB.Exec("DELETE FROM messages")
	models.DB.Exec("DELETE FROM conversations")
	models.DB.Exec("DELETE FROM contact_notes") // Delete contact_notes before contacts
	models.DB.Exec("DELETE FROM contacts")
	models.DB.Exec("DELETE FROM inbox_web_chats")
	models.DB.Exec("DELETE FROM inbox_emails")
	models.DB.Exec("DELETE FROM inbox_users")
	models.DB.Exec("DELETE FROM inboxes")
	models.DB.Exec("DELETE FROM notification_settings") // Delete notification_settings before users
	models.DB.Exec("DELETE FROM user_notifications")    // Delete user_notifications before users
	models.DB.Exec("DELETE FROM canned_responses")      // Delete canned_responses before users
	models.DB.Exec("DELETE FROM company_invites")       // Delete company_invites before companies
	models.DB.Exec("DELETE FROM users")
	models.DB.Exec("DELETE FROM companies")

	fmt.Println("  ✓ All data cleared")
}
