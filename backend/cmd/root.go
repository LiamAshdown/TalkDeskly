package cmd

import (
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "talkdeskly",
	Short: "TalkDeskly CLI - Artisan-like command interface",
	Long: `TalkDeskly CLI provides an Artisan-like command interface for managing 
your chat application. You can run database migrations, seed data with realistic 
fake data, reset databases, and perform various maintenance tasks.

Examples:
  talkdeskly serve                    # Start the web server
  talkdeskly migrate run              # Run database migrations
  talkdeskly seed run                 # Seed with realistic fake data
  talkdeskly reset db --seed          # Reset database and seed fresh data
  talkdeskly reset data --force       # Reset only data (keep schema)
  talkdeskly db status                # Check database connection
  talkdeskly config:show              # Show current configuration
  talkdeskly env:check                # Verify environment setup`,
}

func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {
	rootCmd.Flags().BoolP("help", "h", false, "Help for talkdeskly")
}
