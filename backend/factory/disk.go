package factory

import (
	"fmt"
	"live-chat-server/disk/adapters/local"
	"live-chat-server/disk/adapters/s3"
	"live-chat-server/types"

	awss3 "github.com/aws/aws-sdk-go-v2/service/s3"
)

// DiskType represents the type of disk adapter to create
type DiskType string

const (
	LocalDiskType DiskType = "local"
	S3DiskType    DiskType = "s3"
)

// DiskConfig holds the configuration for creating a disk adapter
type DiskConfig struct {
	Type       DiskType
	BasePath   string
	S3Client   *awss3.Client
	S3Bucket   string
	S3Prefix   string
}

// NewDisk creates a new disk adapter based on the provided configuration
func NewDisk(config DiskConfig) (types.Storage, error) {
	switch config.Type {
	case LocalDiskType:
		return local.NewLocalStorage(config.BasePath)
	case S3DiskType:
		return s3.NewS3Storage(s3.S3Config{
			Client:     config.S3Client,
			Bucket:     config.S3Bucket,
			BasePrefix: config.S3Prefix,
		}), nil
	default:
		return nil, fmt.Errorf("unsupported disk type: %s", config.Type)
	}
} 