package utils

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
)

// IsValidFileType checks if the file extension is in the list of allowed types
func IsValidFileType(filename string, allowedTypes []string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	for _, allowedType := range allowedTypes {
		if ext == allowedType {
			return true
		}
	}
	return false
}

// EnsureDir creates a directory if it doesn't exist
func EnsureDir(dir string) error {
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		return os.MkdirAll(dir, 0755)
	}
	return nil
}

// GenerateUniqueFilename generates a unique filename for uploaded files
func GenerateUniqueFilename(originalFilename string) string {
	ext := filepath.Ext(originalFilename)
	uniqueID := uuid.New().String()
	timestamp := time.Now().Format("20060102150405")
	return fmt.Sprintf("%s_%s%s", timestamp, uniqueID, ext)
}

// DeleteFile deletes a file from the filesystem
func DeleteFile(filepath string) error {
	if _, err := os.Stat(filepath); os.IsNotExist(err) {
		return nil // File doesn't exist, nothing to delete
	}
	return os.Remove(filepath)
}
