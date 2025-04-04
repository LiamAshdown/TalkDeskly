package handler

import (
	"live-chat-server/middleware"
	"live-chat-server/models"
	"live-chat-server/utils"

	"github.com/gofiber/fiber/v2"
)

type ProfileUpdateInput struct {
	FirstName string `json:"first_name" validate:"required"`
	LastName  string `json:"last_name" validate:"required"`
	Email     string `json:"email" validate:"required,email"`
}

type ProfilePasswordUpdateInput struct {
	OldPassword string `json:"old_password" validate:"required"`
	NewPassword string `json:"new_password" validate:"required"`
}

type ProfileResponse struct {
	ID                   string                       `json:"id"`
	CompanyID            *string                      `json:"company_id"`
	FirstName            string                       `json:"first_name"`
	LastName             string                       `json:"last_name"`
	Email                string                       `json:"email"`
	Role                 string                       `json:"role"`
	NotificationSettings *models.NotificationSettings `json:"notification_settings"`
}

func ToProfileResponse(user *models.User) ProfileResponse {
	return ProfileResponse{
		ID:                   user.ID,
		CompanyID:            user.CompanyID,
		FirstName:            user.FirstName,
		LastName:             user.LastName,
		Email:                user.Email,
		Role:                 user.Role,
		NotificationSettings: user.NotificationSettings,
	}
}

func GetProfile(c *fiber.Ctx) error {
	authUser := middleware.GetAuthUser(c)

	var user models.User
	if err := models.DB.Preload("NotificationSettings").First(&user, "id = ?", authUser.ID).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "user_not_found", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "user_found", ToProfileResponse(&user))
}

func UpdateProfile(c *fiber.Ctx) error {
	var input ProfileUpdateInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "bad_request", err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	authUser := middleware.GetAuthUser(c)

	var user models.User
	if err := models.DB.Preload("NotificationSettings").First(&user, "id = ?", authUser.ID).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "user_not_found", err)
	}

	// Check if email is already taken by another user
	if input.Email != user.Email {
		var existingUser models.User
		if err := models.DB.First(&existingUser, "email = ? AND id != ?", input.Email, user.ID).Error; err == nil {
			return utils.ErrorResponse(c, fiber.StatusConflict, "email_taken", nil)
		}
	}

	user.FirstName = input.FirstName
	user.LastName = input.LastName
	user.Email = input.Email

	if err := models.DB.Save(&user).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_update_user", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "user_updated", ToProfileResponse(&user))
}

func UpdateProfilePassword(c *fiber.Ctx) error {
	var input ProfilePasswordUpdateInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "bad_request", err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	authUser := middleware.GetAuthUser(c)

	// Check if old password is correct
	if !utils.CheckPasswordHash(input.OldPassword, authUser.User.Password) {
		return utils.ErrorResponse(c, fiber.StatusUnauthorized, "invalid_old_password", nil)
	}

	hashedNewPassword, err := utils.HashPassword(input.NewPassword)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_hash_password", err)
	}

	authUser.User.Password = hashedNewPassword
	if err := models.DB.Save(&authUser.User).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_update_password", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "password_updated", ToProfileResponse(authUser.User))
}
