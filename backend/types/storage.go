package types

import "io"

// Storage defines the interface for storage operations
type Storage interface {
	// Store saves a file to the storage
	Store(path string, reader io.Reader) (string, error)
	// Get retrieves a file from storage
	Get(path string) (io.ReadCloser, error)
	// Delete removes a file from storage
	Delete(path string) error
	// Exists checks if a file exists in storage
	Exists(path string) (bool, error)
}

// Manager manages storage operations
type Manager interface {
	// Store stores a file in the specified path
	Store(fileType string, filename string, reader io.Reader) error
	// Get retrieves a file from the specified path
	Get(fileType string, filename string) (io.ReadCloser, error)
	// Delete deletes a file from the specified path
	Delete(fileType string, filename string) error
	// Exists checks if a file exists in the specified path
	Exists(fileType string, filename string) (bool, error)
	// SetStorage sets the storage adapter
	SetStorage(storage Storage)
	// CreateStorage creates a new storage adapter
	CreateStorage(config StorageConfig) error
}

// StorageType represents the type of storage adapter
type StorageType string

const (
	LocalStorageType StorageType = "local"
	S3StorageType    StorageType = "s3"
)

// StorageConfig holds the configuration for creating a storage adapter
type StorageConfig struct {
	Type       StorageType
	BasePath   string
	S3Client   interface{} // Using interface{} to avoid AWS SDK dependency
	S3Bucket   string
	S3Prefix   string
}

// DiskManager interface for disk operations
type DiskManager interface {
	Store(fileType string, filename string, reader io.Reader) (string, error)
	Get(fileType string, filename string) (io.ReadCloser, error)
	Delete(fileType string, filename string) error
	Exists(fileType string, filename string) (bool, error)
	SetStorage(storage Storage)
	CreateStorage(config StorageConfig) error
	GetBasePath() string
} 