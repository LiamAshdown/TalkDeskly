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
func Store(path string, reader io.Reader) (string, error) {
	return manager.Store(path, reader)
}

// Get retrieves a file from the specified path
func Get(path string) (io.ReadCloser, error) {
	return manager.Get(path)
}

// Delete deletes a file from the specified path
func Delete(path string) error {
	return manager.Delete(path)
}

// Exists checks if a file exists in the specified path
func Exists(path string) (bool, error) {
	return manager.Exists(path)
}

// GetBasePath returns the base path of the disk manager
func GetBasePath() string {
	return manager.GetBasePath()
}
