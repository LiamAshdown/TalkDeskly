package disk

import (
	"io"

	"live-chat-server/storage"
)

var manager storage.Manager

// Initialize sets up the disk manager with default configuration
func Initialize() storage.Manager {
	manager = NewDiskManager()
	return manager
}

// SetStorage sets the default storage adapter
func SetStorage(storage storage.Storage) {
	manager.SetStorage(storage)
}

// CreateStorage creates a new storage using the factory and sets it as the default
func CreateStorage(config storage.Config) error {
	return manager.CreateStorage(config)
}

// Store stores a file in the specified path
func Store(fileType string, filename string, reader io.Reader) (string, error) {
	return manager.Store(fileType, filename, reader)
}

// Get retrieves a file from the specified path
func Get(fileType string, filename string) (io.ReadCloser, error) {
	return manager.Get(fileType, filename)
}

// Delete deletes a file from the specified path
func Delete(fileType string, filename string) error {
	return manager.Delete(fileType, filename)
}

// Exists checks if a file exists in the specified path
func Exists(fileType string, filename string) (bool, error) {
	return manager.Exists(fileType, filename)
}

// GetBasePath returns the base path of the disk manager
func GetBasePath() string {
	return manager.GetBasePath()
}
