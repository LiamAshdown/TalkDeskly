package cmd

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"live-chat-server/config"

	"github.com/spf13/cobra"
)

const (
	VersionFile = "version.txt"
)

var (
	// Release command flags
	releaseVersion     string
	releaseSkipBuild   bool
	releaseSkipVersion bool
	releaseForce       bool
)

var releaseCmd = &cobra.Command{
	Use:   "release",
	Short: "Build and release the application",
	Long: `Build and release the application with version management.
This command handles version bumping, building frontend/chat-bubble,
and preparing the release.

Examples:
  talkdeskly release                    # Patch version bump and build
  talkdeskly release --version 1.2.3   # Set specific version
  talkdeskly release --skip-build      # Only bump version
  talkdeskly release --skip-version    # Only build (no version change)`,
	RunE: runRelease,
}

func init() {
	releaseCmd.Flags().StringVarP(&releaseVersion, "version", "v", "", "Specific version to set (e.g., 1.2.3)")
	releaseCmd.Flags().BoolVar(&releaseSkipBuild, "skip-build", false, "Skip building frontend and chat-bubble")
	releaseCmd.Flags().BoolVar(&releaseSkipVersion, "skip-version", false, "Skip version bumping")
	releaseCmd.Flags().BoolVar(&releaseForce, "force", false, "Force release without confirmation")
	rootCmd.AddCommand(releaseCmd)
}

func runRelease(cmd *cobra.Command, args []string) error {
	printInfo("🚀 TalkDeskly Release Process")
	printInfo("============================")

	// Read current version
	currentVersion, err := readVersion()
	if err != nil {
		return fmt.Errorf("failed to read current version: %v", err)
	}

	var newVersion string
	if releaseSkipVersion {
		newVersion = currentVersion
		printWarning("Skipping version bump")
	} else {
		if releaseVersion != "" {
			newVersion = releaseVersion
		} else {
			newVersion, err = bumpPatchVersion(currentVersion)
			if err != nil {
				return fmt.Errorf("failed to bump version: %v", err)
			}
		}
	}

	// Show release summary
	fmt.Printf("Current version: %s\n", currentVersion)
	fmt.Printf("New version: %s\n", newVersion)
	fmt.Printf("Skip build: %t\n", releaseSkipBuild)
	fmt.Printf("Skip version: %t\n", releaseSkipVersion)
	fmt.Println()

	// Confirm release
	if !releaseForce {
		if !confirmRelease() {
			printWarning("Release cancelled")
			return nil
		}
	}

	// Update version if not skipping
	if !releaseSkipVersion {
		if err := updateVersion(newVersion); err != nil {
			return fmt.Errorf("failed to update version: %v", err)
		}
		printSuccess(fmt.Sprintf("Version updated to %s", newVersion))
	}

	// Build if not skipping
	if !releaseSkipBuild {
		if err := buildApplication(); err != nil {
			return fmt.Errorf("build failed: %v", err)
		}
		printSuccess("Application built successfully")
	}

	// Generate build info
	if err := generateBuildInfo(newVersion); err != nil {
		return fmt.Errorf("failed to generate build info: %v", err)
	}

	// Success summary
	printSuccess("Release completed successfully!")
	fmt.Println()
	fmt.Println("📦 Release Summary")
	fmt.Println("==================")
	fmt.Printf("✅ Version: %s\n", newVersion)
	if !releaseSkipBuild {
		fmt.Println("✅ Frontend application built and deployed")
		fmt.Println("✅ Chat SDK built and deployed")
	}
	fmt.Println("✅ Build info generated")
	fmt.Println()
	fmt.Println("🌐 Access URLs (when backend is running):")
	fmt.Println("   Frontend App: http://localhost:6721/")
	fmt.Println("   Chat SDK: http://localhost:6721/sdk")

	return nil
}

func readVersion() (string, error) {
	content, err := ioutil.ReadFile(VersionFile)
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(string(content)), nil
}

func updateVersion(version string) error {
	// Update version file
	if err := ioutil.WriteFile(VersionFile, []byte(version), 0644); err != nil {
		return err
	}

	// Update config
	if err := config.SetVersion(version); err != nil {
		return err
	}

	return nil
}

func bumpPatchVersion(version string) (string, error) {
	parts := strings.Split(version, ".")
	if len(parts) != 3 {
		return "", fmt.Errorf("invalid version format: %s", version)
	}

	patch, err := strconv.Atoi(parts[2])
	if err != nil {
		return "", fmt.Errorf("invalid patch version: %s", parts[2])
	}

	patch++
	return fmt.Sprintf("%s.%s.%d", parts[0], parts[1], patch), nil
}

func confirmRelease() bool {
	fmt.Print("Proceed with release? (y/N): ")
	reader := bufio.NewReader(os.Stdin)
	input, err := reader.ReadString('\n')
	if err != nil {
		return false
	}

	input = strings.TrimSpace(strings.ToLower(input))
	return input == "y" || input == "yes"
}

func buildApplication() error {
	backendPublicDir := "public"

	// Create public directory if it doesn't exist
	if err := os.MkdirAll(backendPublicDir, 0755); err != nil {
		return fmt.Errorf("failed to create public directory: %v", err)
	}

	// Clean previous builds
	printInfo("Cleaning previous builds...")
	appDir := filepath.Join(backendPublicDir, "app")
	sdkDir := filepath.Join(backendPublicDir, "sdk")

	os.RemoveAll(appDir)
	os.RemoveAll(sdkDir)

	// Build Frontend
	printInfo("Building frontend application...")
	if err := buildFrontend(backendPublicDir); err != nil {
		return fmt.Errorf("frontend build failed: %v", err)
	}

	// Build Chat Bubble
	printInfo("Building chat-bubble SDK...")
	if err := buildChatBubble(backendPublicDir); err != nil {
		return fmt.Errorf("chat-bubble build failed: %v", err)
	}

	return nil
}

func buildFrontend(backendPublicDir string) error {
	// Check if frontend directory exists
	if _, err := os.Stat("../frontend"); err != nil {
		return fmt.Errorf("frontend directory not found")
	}

	// Change to frontend directory
	originalDir, _ := os.Getwd()
	defer os.Chdir(originalDir)

	if err := os.Chdir("../frontend"); err != nil {
		return err
	}

	// Install dependencies if needed
	if _, err := os.Stat("node_modules"); os.IsNotExist(err) {
		printInfo("Installing frontend dependencies...")
		if err := runCommand("npm", "install"); err != nil {
			return fmt.Errorf("failed to install frontend dependencies: %v", err)
		}
	}

	// Build frontend
	if err := runCommand("npm", "run", "build"); err != nil {
		return fmt.Errorf("frontend build failed: %v", err)
	}

	// Check if dist directory exists
	if _, err := os.Stat("dist"); err != nil {
		return fmt.Errorf("frontend build failed - dist directory not found")
	}

	// Copy to backend public directory
	os.Chdir(originalDir)
	srcDir := "../frontend/dist"
	destDir := filepath.Join(backendPublicDir, "app")

	if err := copyDir(srcDir, destDir); err != nil {
		return fmt.Errorf("failed to copy frontend build: %v", err)
	}

	printSuccess("Frontend build completed")
	return nil
}

func buildChatBubble(backendPublicDir string) error {
	// Check if chat-bubble directory exists
	if _, err := os.Stat("../chat-bubble"); err != nil {
		return fmt.Errorf("chat-bubble directory not found")
	}

	// Change to chat-bubble directory
	originalDir, _ := os.Getwd()
	defer os.Chdir(originalDir)

	if err := os.Chdir("../chat-bubble"); err != nil {
		return err
	}

	// Install dependencies if needed
	if _, err := os.Stat("node_modules"); os.IsNotExist(err) {
		printInfo("Installing chat-bubble dependencies...")
		if err := runCommand("npm", "install"); err != nil {
			return fmt.Errorf("failed to install chat-bubble dependencies: %v", err)
		}
	}

	// Build chat-bubble
	if err := runCommand("npm", "run", "build"); err != nil {
		return fmt.Errorf("chat-bubble build failed: %v", err)
	}

	// Check if dist directory exists
	if _, err := os.Stat("dist"); err != nil {
		return fmt.Errorf("chat-bubble build failed - dist directory not found")
	}

	// Copy to backend public directory
	os.Chdir(originalDir)
	srcDir := "../chat-bubble/dist"
	destDir := filepath.Join(backendPublicDir, "sdk")

	if err := copyDir(srcDir, destDir); err != nil {
		return fmt.Errorf("failed to copy chat-bubble build: %v", err)
	}

	printSuccess("Chat-bubble SDK build completed")
	return nil
}

func generateBuildInfo(version string) error {
	buildInfo := map[string]interface{}{
		"buildDate": time.Now().UTC().Format("2006-01-02T15:04:05Z"),
		"version":   version,
		"components": map[string]string{
			"frontend":   "built",
			"chatBubble": "built",
		},
	}

	// Write to public directory
	buildInfoPath := filepath.Join("public", "build-info.json")
	return writeJSONFile(buildInfoPath, buildInfo)
}

func runCommand(name string, args ...string) error {
	cmd := exec.Command(name, args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func copyDir(src, dst string) error {
	return exec.Command("cp", "-r", src, dst).Run()
}

// Utility functions for colored output
func printInfo(message string) {
	fmt.Printf("\033[0;34m[INFO]\033[0m %s\n", message)
}

func printSuccess(message string) {
	fmt.Printf("\033[0;32m[SUCCESS]\033[0m %s\n", message)
}

func printWarning(message string) {
	fmt.Printf("\033[1;33m[WARNING]\033[0m %s\n", message)
}

func printError(message string) {
	fmt.Printf("\033[0;31m[ERROR]\033[0m %s\n", message)
}

func writeJSONFile(filename string, data interface{}) error {
	// Ensure the directory exists
	if err := os.MkdirAll(filepath.Dir(filename), 0755); err != nil {
		return err
	}

	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	return encoder.Encode(data)
}
