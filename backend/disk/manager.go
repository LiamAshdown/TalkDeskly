package disk

import (
	"errors"
	"fmt"
	"io"

	"live-chat-server/disk/adapters/local"
	"live-chat-server/disk/adapters/s3"
	"live-chat-server/storage"

	awss3 "github.com/aws/aws-sdk-go-v2/service/s3"
)

// DiskManager implements the storage.Manager interface for local disk storage
type DiskManager struct {
	storage  storage.Storage
	basePath string
}

// NewDiskManager creates a new DiskManager instance
func NewDiskManager() storage.Manager {
	return &DiskManager{
		basePath: "uploads",
	}
}

// SetStorage sets the storage adapter
func (m *DiskManager) SetStorage(storage storage.Storage) {
	m.storage = storage
}

// CreateStorage creates a new storage adapter based on the configuration
func (m *DiskManager) CreateStorage(config storage.Config) error {
	m.basePath = config.BasePath

	switch config.Type {
	case storage.LocalType:
		storage, err := local.NewLocalStorage(config.BasePath)
		if err != nil {
			return err
		}
		m.storage = storage
	case storage.S3Type:
		s3Client, ok := config.S3Client.(*awss3.Client)
		if !ok {
			return errors.New("invalid S3 client type")
		}
		m.storage = s3.NewS3Storage(s3.S3Config{
			Client:     s3Client,
			Bucket:     config.S3Bucket,
			BasePrefix: config.S3Prefix,
		})
	default:
		return errors.New("unsupported storage type: " + string(config.Type))
	}
	return nil
}

// Store stores a file in the specified path
func (m *DiskManager) Store(path string, reader io.Reader) (string, error) {
	if m.storage == nil {
		return "", fmt.Errorf("storage not initialized")
	}
	return m.storage.Store(path, reader)
}

// Get retrieves a file from the specified path
func (m *DiskManager) Get(path string) (io.ReadCloser, error) {
	if m.storage == nil {
		return nil, fmt.Errorf("storage not initialized")
	}
	return m.storage.Get(path)
}

// Delete removes a file from the specified path
func (m *DiskManager) Delete(path string) error {
	if m.storage == nil {
		return fmt.Errorf("storage not initialized")
	}
	return m.storage.Delete(path)
}

// Exists checks if a file exists at the specified path
func (m *DiskManager) Exists(path string) (bool, error) {
	if m.storage == nil {
		return false, fmt.Errorf("storage not initialized")
	}
	return m.storage.Exists(path)
}

// GetBasePath returns the base path for storage
func (m *DiskManager) GetBasePath() string {
	return m.basePath
}
