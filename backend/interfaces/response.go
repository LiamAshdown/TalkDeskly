package interfaces

import "github.com/gofiber/fiber/v2"

type ResponseFactory interface {
	SuccessResponse(c *fiber.Ctx, status int, message string, data interface{}) error
	ErrorResponse(c *fiber.Ctx, status int, message string, err error) error
}
