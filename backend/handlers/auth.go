package handler

import (
	"crypto/rand"
	"encoding/hex"
	"time"

	"live-chat-server/config"
	"live-chat-server/interfaces"
	"live-chat-server/listeners"
	"live-chat-server/repositories"
	"live-chat-server/utils"

	"github.com/gofiber/fiber/v2"
)

type AuthHandler struct {
	securityContext interfaces.SecurityContext
	userRepo        repositories.UserRepository
	logger          interfaces.Logger
	langContext     interfaces.LanguageContext
	dispatcher      interfaces.Dispatcher
	emailService    interfaces.EmailService
}

func NewAuthHandler(securityContext interfaces.SecurityContext, userRepo repositories.UserRepository, logger interfaces.Logger, langContext interfaces.LanguageContext, dispatcher interfaces.Dispatcher, emailService interfaces.EmailService) *AuthHandler {
	return &AuthHandler{
		securityContext: securityContext,
		userRepo:        userRepo,
		logger:          logger,
		langContext:     langContext,
		dispatcher:      dispatcher,
		emailService:    emailService,
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

	h.dispatcher.Dispatch(interfaces.EventTypeAuthLogin, &listeners.AuthLoginPayload{
		UserID: user.ID,
	})

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "login_success"), fiber.Map{
		"token": token,
		"user":  user.ToResponse(),
	})
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	h.dispatcher.Dispatch(interfaces.EventTypeAuthLogout, &listeners.AuthLogoutPayload{
		UserID: user.User.ID,
	})

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "logout_success"), nil)
}

func (h *AuthHandler) ForgotPassword(c *fiber.Ctx) error {
	var input struct {
		Email string `json:"email" validate:"required,email"`
	}

	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "invalid_request"), err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	user, err := h.userRepo.GetUserByEmail(input.Email)
	if err != nil || user == nil {
		// Return success even if user doesn't exist (security best practice)
		return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "password_reset_sent"), nil)
	}

	// Generate password reset token
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_generate_token"), err)
	}
	token := hex.EncodeToString(tokenBytes)

	// Set token expiry (1 hour from now)
	expiresAt := time.Now().Add(time.Hour)
	user.PasswordResetToken = &token
	user.PasswordResetExpiresAt = &expiresAt

	if err := h.userRepo.UpdateUser(user); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_save_token"), err)
	}

	// Send password reset email
	resetURL := config.App.FrontendURL + "/reset-password/" + token
	templateData := map[string]interface{}{
		"ResetURL": resetURL,
		"Name":     user.GetFullName(),
	}

	if err := h.emailService.SendTemplatedEmailAsync(user.Email, h.langContext.T(c, "password_reset_subject"), "password_reset.html", templateData); err != nil {
		h.logger.Error("Failed to send password reset email", fiber.Map{
			"email": user.Email,
			"error": err.Error(),
		})
		// Don't return error to user for security reasons
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "password_reset_sent"), nil)
}

func (h *AuthHandler) ResetPassword(c *fiber.Ctx) error {
	var input struct {
		Token    string `json:"token" validate:"required"`
		Password string `json:"password" validate:"required,min=8"`
	}

	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "invalid_request"), err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	user, err := h.userRepo.GetUserByPasswordResetToken(input.Token)
	if err != nil || user == nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "invalid_or_expired_token"), err)
	}

	// Hash the new password
	hashedPassword, err := h.securityContext.HashPassword(input.Password)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_hash_password"), err)
	}

	// Update user password and clear reset token
	user.Password = hashedPassword
	user.PasswordResetToken = nil
	user.PasswordResetExpiresAt = nil

	if err := h.userRepo.UpdateUser(user); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_update_password"), err)
	}

	h.dispatcher.Dispatch(interfaces.EventTypePasswordReset, &listeners.PasswordResetPayload{
		UserID: user.ID,
	})

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "password_reset_success"), nil)
}
