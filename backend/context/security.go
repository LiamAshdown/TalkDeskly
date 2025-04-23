package context

import (
	"live-chat-server/interfaces"
	"live-chat-server/middleware"
	"live-chat-server/utils"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type securityContext struct{}

// NewSecurityContext creates a new security context
func NewSecurityContext() interfaces.SecurityContext {
	return &securityContext{}
}

// GetAuthenticatedUser returns the currently authenticated user
func (s *securityContext) GetAuthenticatedUser(c *fiber.Ctx) *middleware.AuthenticatedUser {
	user, ok := c.Locals("user").(*middleware.AuthenticatedUser)
	if !ok {
		return nil
	}
	return user
}

func (s *securityContext) GenerateToken(userID string) (string, error) {
	return utils.GenerateJWT(userID)
}

func (s *securityContext) ComparePassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

func (s *securityContext) HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}
