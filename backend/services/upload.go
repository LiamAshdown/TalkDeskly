package services

import (
	"errors"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"live-chat-server/storage"
	"live-chat-server/types"
)

// UploadConfig defines configuration for the upload service
type UploadConfig struct {
	MaxFileSize    int64           // Maximum file size in bytes
	AllowedTypes   map[string]bool // Map of allowed file extensions
	DefaultStorage storage.Manager // Default storage manager
}

// DefaultUploadConfig returns a default configuration
func DefaultUploadConfig() UploadConfig {
	return UploadConfig{
		MaxFileSize: 10 * 1024 * 1024, // 10MB default
		AllowedTypes: map[string]bool{
			".jpg": true, ".jpeg": true, ".png": true, ".gif": true,
			".mp4": true, ".mov": true, ".mp3": true, ".wav": true,
			".pdf": true, ".doc": true, ".docx": true, ".txt": true,
			".xls": true, ".xlsx": true, ".ppt": true, ".pptx": true,
			".zip": true, ".rar": true, ".7z": true, ".tar": true,
		},
		DefaultStorage: nil,
	}
}

// UploadService handles file upload operations
type UploadService struct {
	config  UploadConfig
	storage storage.Manager
}

// NewUploadService creates a new instance of UploadService with the given storage manager
func NewUploadService(storage storage.Manager, config UploadConfig) *UploadService {
	return &UploadService{
		config:  config,
		storage: storage,
	}
}

// UploadFile handles the upload of an attachment
func (s *UploadService) UploadFile(fileHeader *multipart.FileHeader, diskLocation string) (*types.UploadResult, error) {
	// Check file size
	if fileHeader.Size > s.config.MaxFileSize {
		return nil, fmt.Errorf("file size exceeds maximum allowed size of %d bytes", s.config.MaxFileSize)
	}

	// Check file type
	extension := strings.ToLower(filepath.Ext(fileHeader.Filename))
	if s.config.AllowedTypes != nil && !s.config.AllowedTypes[extension] {
		return nil, errors.New("file type not allowed")
	}

	file, err := fileHeader.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer file.Close()

	// Get file type category
	fileType := getFileTypeFromExtension(extension)

	// Generate a unique filename to prevent collisions
	timestamp := time.Now().UnixNano()
	pathLocation := fmt.Sprintf("%s/%d%s", diskLocation, timestamp, extension)

	// Store the file using the storage manager
	path, err := s.storage.Store(pathLocation, file)
	if err != nil {
		return nil, fmt.Errorf("failed to store file: %w", err)
	}

	return &types.UploadResult{
		Filename:  fileHeader.Filename,
		Path:      path,
		Extension: extension,
		Size:      fileHeader.Size,
		Type:      fileType,
	}, nil
}

// getFileTypeFromExtension determines the file type category based on extension
func getFileTypeFromExtension(extension string) string {
	switch extension {
	case ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp":
		return "images"
	case ".mp4", ".mov", ".avi", ".wmv", ".flv", ".webm":
		return "videos"
	case ".mp3", ".wav", ".ogg", ".m4a", ".flac":
		return "audio"
	case ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx":
		return "documents"
	default:
		return "other"
	}
}

// CheckFileExists verifies if a file exists in storage
func (s *UploadService) CheckFileExists(path string) (bool, error) {
	return s.storage.Exists(path)
}

// SetMaxFileSize updates the maximum allowed file size
func (s *UploadService) SetMaxFileSize(maxSize int64) {
	s.config.MaxFileSize = maxSize
}

// AddAllowedType adds a file extension to the allowed types list
func (s *UploadService) AddAllowedType(extension string) {
	if s.config.AllowedTypes == nil {
		s.config.AllowedTypes = make(map[string]bool)
	}
	s.config.AllowedTypes[strings.ToLower(extension)] = true
}

// RemoveAllowedType removes a file extension from the allowed types list
func (s *UploadService) RemoveAllowedType(extension string) {
	if s.config.AllowedTypes != nil {
		delete(s.config.AllowedTypes, strings.ToLower(extension))
	}
}

// DeleteFile removes a file from storage
func (s *UploadService) DeleteFile(path string) error {
	return s.storage.Delete(path)
}
