package local

import (
	"io"
	"os"
	"path/filepath"

	"live-chat-server/types"
)

// LocalStorage implements types.Storage for local filesystem
type LocalStorage struct {
	basePath string
}

// NewLocalStorage creates a new LocalStorage instance
func NewLocalStorage(basePath string) (types.Storage, error) {
	// Ensure base path exists
	if err := os.MkdirAll(basePath, 0755); err != nil {
		return nil, err
	}
	
	return &LocalStorage{
		basePath: basePath,
	}, nil
}

// Store saves a file to the local filesystem
func (s *LocalStorage) Store(path string, reader io.Reader) (string, error) {
	fullPath := filepath.Join(s.basePath, path)
	
	// Create directory if it doesn't exist
	dir := filepath.Dir(fullPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", err
	}
	
	// Create the file
	file, err := os.Create(fullPath)
	if err != nil {
		return "", err
	}
	defer file.Close()
	
	// Copy the content
	_, err = io.Copy(file, reader)
	if err != nil {
		return "", err
	}
	
	return fullPath, nil
}

// Get retrieves a file from the local filesystem
func (s *LocalStorage) Get(path string) (io.ReadCloser, error) {
	fullPath := filepath.Join(s.basePath, path)
	return os.Open(fullPath)
}

// Delete removes a file from the local filesystem
func (s *LocalStorage) Delete(path string) error {
	fullPath := filepath.Join(s.basePath, path)
	return os.Remove(fullPath)
}

// Exists checks if a file exists in the local filesystem
func (s *LocalStorage) Exists(path string) (bool, error) {
	fullPath := filepath.Join(s.basePath, path)
	_, err := os.Stat(fullPath)
	if err == nil {
		return true, nil
	}
	if os.IsNotExist(err) {
		return false, nil
	}
	return false, err
} 