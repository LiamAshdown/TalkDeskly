package storage

import (
	"io"
)

// StorageType represents the type of storage
type StorageType string

const (
	// LocalType represents local filesystem storage
	LocalType StorageType = "local"
	// S3Type represents AWS S3 storage
	S3Type StorageType = "s3"
)

// Storage interface defines methods for file storage operations
type Storage interface {
	// Store saves a file and returns its path
	Store(path string, reader io.Reader) (string, error)
	// Get retrieves a file
	Get(path string) (io.ReadCloser, error)
	// Delete removes a file
	Delete(path string) error
	// Exists checks if a file exists
	Exists(path string) (bool, error)
}

// Config holds configuration for storage
type Config struct {
	Type       StorageType
	BasePath   string
	S3Client   interface{}
	S3Bucket   string
	S3Prefix   string
}

// Manager interface defines methods for managing storage
type Manager interface {
	// SetStorage sets the storage adapter
	SetStorage(storage Storage)
	// CreateStorage creates a new storage adapter
	CreateStorage(config Config) error
	// Store stores a file
	Store(fileType string, filename string, reader io.Reader) (string, error)
	// Get retrieves a file
	Get(fileType string, filename string) (io.ReadCloser, error)
	// Delete deletes a file
	Delete(fileType string, filename string) error
	// Exists checks if a file exists
	Exists(fileType string, filename string) (bool, error)
	// GetBasePath returns the base path
	GetBasePath() string
} 