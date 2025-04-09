package s3

import (
	"context"
	"errors"
	"io"
	"live-chat-server/types"
	"path"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	s3types "github.com/aws/aws-sdk-go-v2/service/s3/types"
)

// S3Storage implements Storage interface for AWS S3 storage
type S3Storage struct {
	client     *s3.Client
	bucket     string
	basePrefix string
}

// S3Config holds the configuration for S3 storage
type S3Config struct {
	Client     *s3.Client
	Bucket     string
	BasePrefix string
}

// NewS3Storage creates a new S3Storage instance
func NewS3Storage(config S3Config) types.Storage {
	return &S3Storage{
		client:     config.Client,
		bucket:     config.Bucket,
		basePrefix: config.BasePrefix,
	}
}

// Store implements interfaces.Storage.Store
func (d *S3Storage) Store(filePath string, reader io.Reader) (string, error) {
	key := path.Join(d.basePrefix, filePath)
	
	_, err := d.client.PutObject(context.Background(), &s3.PutObjectInput{
		Bucket: aws.String(d.bucket),
		Key:    aws.String(key),
		Body:   reader,
	})
	
	return key, err
}

// Get implements interfaces.Storage.Get
func (d *S3Storage) Get(filePath string) (io.ReadCloser, error) {
	key := path.Join(d.basePrefix, filePath)
	
	result, err := d.client.GetObject(context.Background(), &s3.GetObjectInput{
		Bucket: aws.String(d.bucket),
		Key:    aws.String(key),
	})
	
	if err != nil {
		return nil, err
	}
	
	return result.Body, nil
}

// Delete implements interfaces.Storage.Delete
func (d *S3Storage) Delete(filePath string) error {
	key := path.Join(d.basePrefix, filePath)
	
	_, err := d.client.DeleteObject(context.Background(), &s3.DeleteObjectInput{
		Bucket: aws.String(d.bucket),
		Key:    aws.String(key),
	})
	
	return err
}

// Exists implements Storage.Exists
func (d *S3Storage) Exists(filePath string) (bool, error) {
	key := path.Join(d.basePrefix, filePath)
	
	_, err := d.client.HeadObject(context.Background(), &s3.HeadObjectInput{
		Bucket: aws.String(d.bucket),
		Key:    aws.String(key),
	})
	
	if err != nil {
		var apiErr *s3types.NotFound
		if errors.As(err, &apiErr) {
			return false, nil
		}
		return false, err
	}
	
	return true, nil
} 