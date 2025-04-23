package handler

import (
	"live-chat-server/interfaces"
	"live-chat-server/repositories"
	"live-chat-server/utils"

	"github.com/gofiber/fiber/v2"
)

type AuthHandler struct {
	securityContext interfaces.SecurityContext
	userRepo        repositories.UserRepository
	logger          interfaces.Logger
	langContext     interfaces.LanguageContext
}

func NewAuthHandler(securityContext interfaces.SecurityContext, userRepo repositories.UserRepository, logger interfaces.Logger, langContext interfaces.LanguageContext) *AuthHandler {
	return &AuthHandler{
		securityContext: securityContext,
		userRepo:        userRepo,
		logger:          logger,
		langContext:     langContext,
	}
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var input struct {
		Email    string `json:"email" validate:"required,email"`
		Password string `json:"password" validate:"required"`
	}

	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "invalid_request"), err)
	}

	user, err := h.userRepo.GetUserByEmail(input.Email)
	if user == nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "invalid_email_or_password"), err)
	}

	if err := h.securityContext.ComparePassword(user.Password, input.Password); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "invalid_email_or_password"), err)
	}

	token, err := h.securityContext.GenerateToken(user.ID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_generate_token"), err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "login_success"), fiber.Map{
		"token": token,
		"user":  user.ToResponse(),
	})
}
