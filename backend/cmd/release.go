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
	// Docker-related flags
	releaseDockerRegistry string
	releaseDockerImage    string
	releaseSkipDocker     bool
	releaseDockerPush     bool
	// Git-related flags
	releaseSkipGitTag bool
	releaseGitPushTag bool
)

var releaseCmd = &cobra.Command{
	Use:   "release",
	Short: "Build and release the application",
	Long: `Build and release the application with version management.
This command handles version bumping, building frontend/chat-bubble,
building Docker images, and preparing the release.

Examples:
  talkdeskly release                                    # Patch version bump and build
  talkdeskly release --version 1.2.3                   # Set specific version
  talkdeskly release --skip-build                      # Only bump version
  talkdeskly release --skip-version                    # Only build (no version change)
  talkdeskly release --docker-push                     # Build and push Docker image
  talkdeskly release --docker-image myapp --docker-push # Custom image name and push
  talkdeskly release --skip-docker                     # Skip Docker build entirely
  talkdeskly release --git-push-tag                    # Create and push Git tag
  talkdeskly release --skip-git-tag                    # Skip Git tag creation`,
	RunE: runRelease,
}

func init() {
	releaseCmd.Flags().StringVarP(&releaseVersion, "version", "v", "", "Specific version to set (e.g., 1.2.3)")
	releaseCmd.Flags().BoolVar(&releaseSkipBuild, "skip-build", false, "Skip building frontend and chat-bubble")
	releaseCmd.Flags().BoolVar(&releaseSkipVersion, "skip-version", false, "Skip version bumping")
	releaseCmd.Flags().BoolVar(&releaseForce, "force", false, "Force release without confirmation")

	// Docker flags
	releaseCmd.Flags().StringVar(&releaseDockerRegistry, "docker-registry", "", "Docker registry URL (e.g., docker.io, ghcr.io)")
	releaseCmd.Flags().StringVar(&releaseDockerImage, "docker-image", "talkdeskly", "Docker image name")
	releaseCmd.Flags().BoolVar(&releaseSkipDocker, "skip-docker", false, "Skip Docker image building")
	releaseCmd.Flags().BoolVar(&releaseDockerPush, "docker-push", false, "Push Docker image to registry after building")

	// Git flags
	releaseCmd.Flags().BoolVar(&releaseSkipGitTag, "skip-git-tag", false, "Skip creating Git tag for the release")
	releaseCmd.Flags().BoolVar(&releaseGitPushTag, "git-push-tag", false, "Push Git tag to remote repository after creating")

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
	fmt.Printf("Skip Docker: %t\n", releaseSkipDocker)
	if !releaseSkipDocker {
		fmt.Printf("Docker image: %s\n", getDockerImageName(newVersion))
		fmt.Printf("Docker push: %t\n", releaseDockerPush)
	}
	fmt.Printf("Skip Git tag: %t\n", releaseSkipGitTag)
	if !releaseSkipGitTag {
		fmt.Printf("Git tag: v%s\n", newVersion)
		fmt.Printf("Git push tag: %t\n", releaseGitPushTag)
	}
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

	// Build Docker image if not skipping
	if !releaseSkipDocker {
		if err := buildDockerImage(newVersion); err != nil {
			return fmt.Errorf("Docker build failed: %v", err)
		}
		printSuccess("Docker image built successfully")

		// Push Docker image if requested
		if releaseDockerPush {
			if err := pushDockerImage(newVersion); err != nil {
				return fmt.Errorf("Docker push failed: %v", err)
			}
			printSuccess("Docker image pushed successfully")
		}
	}

	// Create Git tag if not skipping
	if !releaseSkipGitTag {
		if err := createGitTag(newVersion); err != nil {
			return fmt.Errorf("Git tag creation failed: %v", err)
		}
		printSuccess(fmt.Sprintf("Git tag v%s created successfully", newVersion))

		// Push Git tag if requested
		if releaseGitPushTag {
			if err := pushGitTag(newVersion); err != nil {
				return fmt.Errorf("Git tag push failed: %v", err)
			}
			printSuccess(fmt.Sprintf("Git tag v%s pushed successfully", newVersion))
		}
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
	if !releaseSkipDocker {
		fmt.Printf("✅ Docker image built: %s\n", getDockerImageName(newVersion))
		if releaseDockerPush {
			fmt.Println("✅ Docker image pushed to registry")
		}
	}
	if !releaseSkipGitTag {
		fmt.Printf("✅ Git tag v%s created\n", newVersion)
		if releaseGitPushTag {
			fmt.Println("✅ Git tag pushed to remote repository")
		}
	}
	fmt.Println("✅ Build info generated")
	fmt.Println()
	fmt.Println("🌐 Access URLs (when backend is running):")
	fmt.Println("   Frontend App: http://localhost:6721/")
	fmt.Println("   Chat SDK: http://localhost:6721/sdk")
	if !releaseSkipDocker {
		fmt.Println()
		fmt.Println("🐳 Docker Usage:")
		if releaseDockerPush {
			fmt.Printf("   docker pull %s\n", getDockerImageName(newVersion))
		}
		fmt.Printf("   docker run -p 8080:8080 %s\n", getDockerImageName(newVersion))
	}

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
	if err := config.NewConfigManager().SetVersion(version); err != nil {
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
	components := map[string]string{}

	if !releaseSkipBuild {
		components["frontend"] = "built"
		components["chatBubble"] = "built"
	}

	if !releaseSkipDocker {
		components["docker"] = "built"
		if releaseDockerPush {
			components["dockerPushed"] = "true"
		}
	}

	buildInfo := map[string]interface{}{
		"buildDate":  time.Now().UTC().Format("2006-01-02T15:04:05Z"),
		"version":    version,
		"components": components,
	}

	if !releaseSkipDocker {
		buildInfo["dockerImage"] = getDockerImageName(version)
		if releaseDockerRegistry != "" {
			buildInfo["dockerRegistry"] = releaseDockerRegistry
		}
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

// Git-related functions

func createGitTag(version string) error {
	printInfo("Creating Git tag...")

	tagName := fmt.Sprintf("v%s", version)

	// Check if tag already exists
	checkCmd := exec.Command("git", "tag", "-l", tagName)
	output, err := checkCmd.Output()
	if err != nil {
		return fmt.Errorf("failed to check existing tags: %v", err)
	}

	if strings.TrimSpace(string(output)) != "" {
		return fmt.Errorf("tag %s already exists", tagName)
	}

	// Create the tag
	if err := runCommand("git", "tag", "-a", tagName, "-m", fmt.Sprintf("Release %s", version)); err != nil {
		return fmt.Errorf("failed to create Git tag: %v", err)
	}

	printInfo(fmt.Sprintf("Git tag %s created", tagName))
	return nil
}

func pushGitTag(version string) error {
	printInfo("Pushing Git tag...")

	tagName := fmt.Sprintf("v%s", version)

	// Push the tag to origin
	if err := runCommand("git", "push", "origin", tagName); err != nil {
		return fmt.Errorf("failed to push Git tag: %v", err)
	}

	printInfo(fmt.Sprintf("Git tag %s pushed to remote repository", tagName))
	return nil
}

// Docker-related functions

func getDockerImageName(version string) string {
	imageName := releaseDockerImage
	if releaseDockerRegistry != "" {
		imageName = fmt.Sprintf("%s/%s", releaseDockerRegistry, imageName)
	}
	return fmt.Sprintf("%s:%s", imageName, version)
}

func buildDockerImage(version string) error {
	printInfo("Building multi-platform Docker image...")

	imageName := getDockerImageName(version)
	latestImageName := fmt.Sprintf("%s:latest", getBaseImageName())

	// Build multi-platform Docker image using buildx
	buildArgs := []string{
		"buildx", "build",
		"--platform", "linux/amd64,linux/arm64",
		"-f", "docker/Dockerfile.prod",
		"-t", imageName,
		"-t", latestImageName,
	}

	// If pushing, add --push flag, otherwise load to local docker
	if releaseDockerPush {
		buildArgs = append(buildArgs, "--push")
	} else {
		buildArgs = append(buildArgs, "--load")
		printWarning("Note: Multi-platform images can't be loaded locally. Consider using --docker-push to push to registry.")
	}

	buildArgs = append(buildArgs, ".")

	if err := runDockerCommand("docker", buildArgs...); err != nil {
		return fmt.Errorf("failed to build Docker image: %v", err)
	}

	printInfo(fmt.Sprintf("Multi-platform Docker image built: %s", imageName))
	return nil
}

func pushDockerImage(version string) error {
	printInfo("Docker images were pushed during build (using buildx --push)")

	if releaseDockerRegistry == "" {
		return fmt.Errorf("docker registry must be specified when pushing (use --docker-registry)")
	}

	imageName := getDockerImageName(version)
	latestImageName := fmt.Sprintf("%s:latest", getBaseImageName())

	printInfo(fmt.Sprintf("Multi-platform Docker images pushed: %s and %s", imageName, latestImageName))
	return nil
}

func getBaseImageName() string {
	if releaseDockerRegistry != "" {
		return fmt.Sprintf("%s/%s", releaseDockerRegistry, releaseDockerImage)
	}
	return releaseDockerImage
}

func runDockerCommand(name string, args ...string) error {
	cmd := exec.Command(name, args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Dir = "." // Ensure we're in the backend directory
	return cmd.Run()
}
