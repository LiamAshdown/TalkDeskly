package interfaces

import (
	"live-chat-server/middleware"

	"github.com/gofiber/fiber/v2"
)

// SecurityContext defines the interface for security-related operations
type SecurityContext interface {
	// GetAuthenticatedUser returns the currently authenticated user
	GetAuthenticatedUser(c *fiber.Ctx) *middleware.AuthenticatedUser
	GenerateToken(userID string) (string, error)
	ComparePassword(hashedPassword, password string) error
	HashPassword(password string) (string, error)
}
