package utils

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
)

type APIResponse struct {
	StatusCode int         `json:"status_code"`
	Status     string      `json:"status"`
	Message    string      `json:"message"`
	Data       interface{} `json:"data,omitempty"`
}

type APIError struct {
	StatusCode int         `json:"status_code"`
	Error      string      `json:"error"`
	Message    string      `json:"message"`
	Data       interface{} `json:"data,omitempty"`
}

func SuccessResponse(c *fiber.Ctx, statusCode int, message string, data interface{}) error {
	return c.Status(statusCode).JSON(APIResponse{
		StatusCode: statusCode,
		Status:     http.StatusText(statusCode),
		Message:    message,
		Data:       data,
	})
}

func ErrorResponse(c *fiber.Ctx, statusCode int, message string, data interface{}) error {
	return c.Status(statusCode).JSON(APIError{
		StatusCode: statusCode,
		Error:      http.StatusText(statusCode),
		Message:    message,
		Data:       data,
	})
}

func ValidationErrorResponse(c *fiber.Ctx, errors interface{}) error {
	return ErrorResponse(c, fiber.StatusUnprocessableEntity, "validation_failed", errors)
}

func DataResponse(c *fiber.Ctx, message string, data interface{}) error {
	return SuccessResponse(c, fiber.StatusOK, message, data)
}

func CreatedResponse(c *fiber.Ctx, message string, data interface{}) error {
	return SuccessResponse(c, fiber.StatusCreated, message, data)
}

func NoContentResponse(c *fiber.Ctx) error {
	return c.Status(fiber.StatusNoContent).Send(nil)
}
