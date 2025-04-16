package handler

import (
	"live-chat-server/interfaces"
	"live-chat-server/repositories"
	"live-chat-server/storage"
	"live-chat-server/utils"

	"github.com/gofiber/fiber/v2"
)

type ProfileUpdateInput struct {
	FirstName string `json:"first_name" validate:"required"`
	LastName  string `json:"last_name" validate:"required"`
	Email     string `json:"email" validate:"required,email"`
	Language  string `json:"language" validate:"omitempty"`
}

type ProfilePasswordUpdateInput struct {
	OldPassword string `json:"old_password" validate:"required"`
	NewPassword string `json:"new_password" validate:"required"`
}

type ProfileHandler struct {
	repo            repositories.UserRepository
	dispatcher      interfaces.Dispatcher
	diskManager     storage.Manager
	securityContext interfaces.SecurityContext
	logger          interfaces.Logger
}

func NewProfileHandler(repo repositories.UserRepository, dispatcher interfaces.Dispatcher, diskManager storage.Manager, securityContext interfaces.SecurityContext, logger interfaces.Logger) *ProfileHandler {
	return &ProfileHandler{repo: repo, dispatcher: dispatcher, diskManager: diskManager, securityContext: securityContext, logger: logger}
}

func (h *ProfileHandler) GetProfile(c *fiber.Ctx) error {
	authUser := h.securityContext.GetAuthenticatedUser(c)

	user, err := h.repo.GetUserByID(authUser.ID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "user_not_found", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "user_found", user.ToProfileResponse())
}

func (h *ProfileHandler) UpdateProfile(c *fiber.Ctx) error {
	var input ProfileUpdateInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "bad_request", err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	authUser := h.securityContext.GetAuthenticatedUser(c)

	user, err := h.repo.GetUserByID(authUser.ID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "user_not_found", err)
	}

	// Check if email is already taken by another user
	if input.Email != user.Email {
		existingUser, _ := h.repo.GetUserByEmail(input.Email)
		if existingUser != nil {
			return utils.ErrorResponse(c, fiber.StatusConflict, "email_taken", nil)
		}
	}

	user.FirstName = input.FirstName
	user.LastName = input.LastName
	user.Email = input.Email

	// Update language if provided
	if input.Language != "" {
		user.Language = input.Language
	}

	if err := h.repo.UpdateUser(user); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_update_user", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "user_updated", user.ToProfileResponse())
}

func (h *ProfileHandler) UpdateProfilePassword(c *fiber.Ctx) error {
	var input ProfilePasswordUpdateInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "bad_request", err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	authUser := h.securityContext.GetAuthenticatedUser(c)

	// Check if old password is correct
	if !utils.CheckPasswordHash(input.OldPassword, authUser.User.Password) {
		return utils.ErrorResponse(c, fiber.StatusUnauthorized, "invalid_old_password", nil)
	}

	hashedNewPassword, err := utils.HashPassword(input.NewPassword)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_hash_password", err)
	}

	authUser.User.Password = hashedNewPassword
	if err := h.repo.UpdateUser(authUser.User); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_update_password", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "password_updated", authUser.User.ToProfileResponse())
}

func (h *ProfileHandler) UpdateProfileAvatar(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	filename, err := fileService.UploadFile(c, "avatar", "user-avatars")
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "file_upload_failed", err)
	}

	if user.User.AvatarPath != nil {
		if err := h.diskManager.Delete("user-avatars", *user.User.AvatarPath); err != nil {
			// Log the error but continue with the update
			// The old file might have been already deleted
		}
	}

	user.User.AvatarPath = &filename
	if err := h.repo.UpdateUser(user.User); err != nil {
		// Clean up the uploaded file if database update fails
		h.diskManager.Delete("user-avatars", filename)
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_update_avatar", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "avatar_updated", user.User.ToProfileResponse())
}
