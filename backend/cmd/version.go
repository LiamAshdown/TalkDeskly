package cmd

import (
	"fmt"
	"io/ioutil"
	"strconv"
	"strings"

	"live-chat-server/config"

	"github.com/spf13/cobra"
)

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print the version number of TalkDeskly",
	Long:  `All software has versions. This is TalkDeskly's`,
	Run: func(cmd *cobra.Command, args []string) {
		version := getCurrentVersion()
		fmt.Printf("TalkDeskly v%s\n", version)
		fmt.Println("A modern chat application built with Go and React")
	},
}

func getCurrentVersion() string {
	// Try to read from version file first
	if content, err := ioutil.ReadFile("version.txt"); err == nil {
		return strings.TrimSpace(string(content))
	}

	// Fallback to config
	config.Load()
	if config.App.Version != "" {
		return config.App.Version
	}

	// Final fallback
	return "0.0.1"
}

var versionBumpCmd = &cobra.Command{
	Use:   "bump [patch|minor|major]",
	Short: "Bump version number",
	Long:  `Bump the version number by patch, minor, or major increment`,
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		bumpType := args[0]
		if bumpType != "patch" && bumpType != "minor" && bumpType != "major" {
			return fmt.Errorf("invalid bump type: %s. Use patch, minor, or major", bumpType)
		}

		currentVersion := getCurrentVersion()
		newVersion, err := bumpVersion(currentVersion, bumpType)
		if err != nil {
			return err
		}

		fmt.Printf("Bumping version from %s to %s\n", currentVersion, newVersion)
		return updateVersionFiles(newVersion)
	},
}

var versionSetCmd = &cobra.Command{
	Use:   "set [version]",
	Short: "Set specific version number",
	Long:  `Set a specific version number (e.g., 1.2.3)`,
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		newVersion := args[0]
		if !isValidVersion(newVersion) {
			return fmt.Errorf("invalid version format: %s. Use semantic versioning (e.g., 1.2.3)", newVersion)
		}

		currentVersion := getCurrentVersion()
		fmt.Printf("Setting version from %s to %s\n", currentVersion, newVersion)
		return updateVersionFiles(newVersion)
	},
}

func bumpVersion(version, bumpType string) (string, error) {
	parts := strings.Split(version, ".")
	if len(parts) != 3 {
		return "", fmt.Errorf("invalid version format: %s", version)
	}

	major, err := strconv.Atoi(parts[0])
	if err != nil {
		return "", fmt.Errorf("invalid major version: %s", parts[0])
	}

	minor, err := strconv.Atoi(parts[1])
	if err != nil {
		return "", fmt.Errorf("invalid minor version: %s", parts[1])
	}

	patch, err := strconv.Atoi(parts[2])
	if err != nil {
		return "", fmt.Errorf("invalid patch version: %s", parts[2])
	}

	switch bumpType {
	case "major":
		major++
		minor = 0
		patch = 0
	case "minor":
		minor++
		patch = 0
	case "patch":
		patch++
	}

	return fmt.Sprintf("%d.%d.%d", major, minor, patch), nil
}

func isValidVersion(version string) bool {
	parts := strings.Split(version, ".")
	if len(parts) != 3 {
		return false
	}

	for _, part := range parts {
		if _, err := strconv.Atoi(part); err != nil {
			return false
		}
	}

	return true
}

func updateVersionFiles(version string) error {
	// Update version file
	if err := ioutil.WriteFile("version.txt", []byte(version), 0644); err != nil {
		return fmt.Errorf("failed to update version file: %v", err)
	}

	// Update config
	if err := config.SetVersion(version); err != nil {
		return fmt.Errorf("failed to update config: %v", err)
	}

	fmt.Printf("✅ Version updated to %s\n", version)
	return nil
}

func init() {
	rootCmd.AddCommand(versionCmd)

	// Add version subcommands
	versionCmd.AddCommand(versionBumpCmd)
	versionCmd.AddCommand(versionSetCmd)
}
