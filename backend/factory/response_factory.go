package factory

import (
	"live-chat-server/interfaces"
	"live-chat-server/utils"

	"github.com/gofiber/fiber/v2"
)

type ResponseFactory struct {
}

func NewResponseFactory() interfaces.ResponseFactory {
	return &ResponseFactory{}
}

func (f *ResponseFactory) SuccessResponse(c *fiber.Ctx, status int, message string, data interface{}) error {
	return utils.SuccessResponse(c, status, message, data)
}

func (f *ResponseFactory) ErrorResponse(c *fiber.Ctx, status int, message string, err error) error {
	return utils.ErrorResponse(c, status, message, err)
}
