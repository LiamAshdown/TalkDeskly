package interfaces

import (
	"live-chat-server/types"
	"mime/multipart"

	"github.com/gofiber/fiber/v2"
)

// LanguageContext provides language-related functionality
type LanguageContext interface {
	// GetLanguage returns the current language from the context
	GetLanguage(c *fiber.Ctx) string

	// Translate translates a key to the current language
	T(c *fiber.Ctx, key string) string
}

type UploadService interface {
	UploadFile(fileHeader *multipart.FileHeader, diskLocation string) (*types.UploadResult, error)
	DeleteFile(path string) error
}
