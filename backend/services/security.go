package services

import (
	"live-chat-server/interfaces"
	"live-chat-server/middleware"

	"github.com/gofiber/fiber/v2"
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
