package services

import (
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"live-chat-server/utils"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"github.com/chai2010/webp"
	"github.com/disintegration/imaging"
	"github.com/gofiber/fiber/v2"
)

type FileUploadConfig struct {
	MaxSize      int64
	AllowedTypes []string
	UploadDir    string
	// Image processing options
	MaxWidth  int
	MaxHeight int
	Quality   int    // JPEG quality (1-100)
	Format    string // "jpeg" or "png"
}

var (
	DefaultImageConfig = FileUploadConfig{
		MaxSize:      5 * 1024 * 1024, // 5MB
		AllowedTypes: []string{".jpg", ".jpeg", ".png", ".gif", ".webp"},
		UploadDir:    "./uploads",
		MaxWidth:     800,
		MaxHeight:    800,
		Quality:      85,
		Format:       "jpeg",
	}
)

type FileService struct {
	config FileUploadConfig
}

func NewFileService(config FileUploadConfig) *FileService {
	return &FileService{
		config: config,
	}
}

func (s *FileService) UploadFile(c *fiber.Ctx, fieldName string) (string, error) {
	// Get and validate the uploaded file
	file, err := s.ValidateAndGetFile(c, fieldName)
	if err != nil {
		return "", err
	}

	// Generate output filename
	filename := s.GenerateOutputFilename(file.Filename)

	// Ensure upload directory exists
	if err := utils.EnsureDir(s.config.UploadDir); err != nil {
		return "", err
	}

	// Process the image
	src, err := s.ProcessImage(c, file)
	if err != nil {
		return "", err
	}

	// Save the processed image
	return s.SaveProcessedImage(src, filename)
}

func (s *FileService) ValidateAndGetFile(c *fiber.Ctx, fieldName string) (*multipart.FileHeader, error) {
	file, err := c.FormFile(fieldName)
	if err != nil {
		return nil, err
	}

	if file.Size > s.config.MaxSize {
		return nil, fiber.NewError(fiber.StatusBadRequest, "file_too_large")
	}

	if !utils.IsValidFileType(file.Filename, s.config.AllowedTypes) {
		return nil, fiber.NewError(fiber.StatusBadRequest, "invalid_file_type")
	}

	return file, nil
}

func (s *FileService) GenerateOutputFilename(originalFilename string) string {
	filename := utils.GenerateUniqueFilename(originalFilename)
	return strings.TrimSuffix(filename, filepath.Ext(filename)) + "." + s.config.Format
}

func (s *FileService) ProcessImage(c *fiber.Ctx, file *multipart.FileHeader) (image.Image, error) {
	// Create and manage temporary file
	tempFile, tempPath, err := s.CreateTempFile(file)
	if err != nil {
		return nil, err
	}
	defer func() {
		tempFile.Close()
		os.Remove(tempPath)
	}()

	// Save uploaded file to temp
	if err := s.SaveToTemp(c, file, tempPath); err != nil {
		return nil, err
	}

	// Decode the image based on format
	return s.DecodeImage(tempPath)
}

func (s *FileService) CreateTempFile(file *multipart.FileHeader) (*os.File, string, error) {
	ext := filepath.Ext(file.Filename)
	tempFile, err := os.CreateTemp("", "upload-*"+ext)
	if err != nil {
		return nil, "", fmt.Errorf("failed to create temp file: %w", err)
	}
	return tempFile, tempFile.Name(), nil
}

func (s *FileService) SaveToTemp(c *fiber.Ctx, file *multipart.FileHeader, tempPath string) error {
	if err := c.SaveFile(file, tempPath); err != nil {
		return fmt.Errorf("failed to save uploaded file: %w", err)
	}
	return nil
}

func (s *FileService) DecodeImage(tempPath string) (image.Image, error) {
	ext := strings.ToLower(filepath.Ext(tempPath))
	switch ext {
	case ".webp":
		return s.DecodeWebP(tempPath)
	default:
		return s.DecodeOtherFormats(tempPath)
	}
}

func (s *FileService) DecodeWebP(tempPath string) (image.Image, error) {
	webpFile, err := os.Open(tempPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open webp file: %w", err)
	}
	defer webpFile.Close()

	src, err := webp.Decode(webpFile)
	if err != nil {
		return nil, fmt.Errorf("failed to decode webp: %w", err)
	}
	return src, nil
}

func (s *FileService) DecodeOtherFormats(tempPath string) (image.Image, error) {
	src, err := imaging.Open(tempPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open image: %w", err)
	}
	return src, nil
}

func (s *FileService) SaveProcessedImage(src image.Image, filename string) (string, error) {
	// Resize if needed
	src = s.ResizeIfNeeded(src)

	// Create output file
	outFile, err := os.Create(s.config.UploadDir + "/" + filename)
	if err != nil {
		return "", fmt.Errorf("failed to create output file: %w", err)
	}
	defer outFile.Close()

	// Encode and save
	if err := s.EncodeAndSave(outFile, src); err != nil {
		return "", err
	}

	return filename, nil
}

func (s *FileService) ResizeIfNeeded(src image.Image) image.Image {
	if src.Bounds().Dx() > s.config.MaxWidth || src.Bounds().Dy() > s.config.MaxHeight {
		return imaging.Fit(src, s.config.MaxWidth, s.config.MaxHeight, imaging.Lanczos)
	}
	return src
}

func (s *FileService) EncodeAndSave(outFile *os.File, src image.Image) error {
	switch s.config.Format {
	case "jpeg":
		return jpeg.Encode(outFile, src, &jpeg.Options{Quality: s.config.Quality})
	case "png":
		return png.Encode(outFile, src)
	default:
		return fmt.Errorf("unsupported format: %s", s.config.Format)
	}
}

func (s *FileService) DeleteFile(filename string) error {
	if filename == "" {
		return nil
	}
	return utils.DeleteFile(s.config.UploadDir + "/" + filename)
}
