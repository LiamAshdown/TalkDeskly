package handler

import (
	"live-chat-server/middleware"
	"live-chat-server/models"
	"live-chat-server/utils"

	"github.com/gofiber/fiber/v2"
)

type AdminUserCreateInput struct {
	FirstName string `json:"first_name" validate:"required"`
	LastName  string `json:"last_name" validate:"required"`
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=6"`
	Role      string `json:"role" validate:"required,oneof=admin user"`
}

type AdminUserUpdateInput struct {
	FirstName string `json:"first_name" validate:"required"`
	LastName  string `json:"last_name" validate:"required"`
	Email     string `json:"email" validate:"required,email"`
	Role      string `json:"role" validate:"required,oneof=admin user"`
}

func GetUsers(c *fiber.Ctx) error {
	authUser := middleware.GetAuthUser(c)

	var users []models.User
	if err := models.DB.Preload("NotificationSettings").Where("company_id = ?", authUser.User.CompanyID).Find(&users).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_fetch_users", err)
	}

	var response []interface{}
	for _, user := range users {
		response = append(response, user.ToResponse())
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "users_found", response)
}

func GetUser(c *fiber.Ctx) error {
	authUser := middleware.GetAuthUser(c)
	userID := c.Params("id")

	var user models.User
	if err := models.DB.Preload("NotificationSettings").First(&user, "id = ? AND company_id = ?", userID, authUser.User.CompanyID).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "user_not_found", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "user_found", ToProfileResponse(&user))
}

func CreateCompanyUser(c *fiber.Ctx) error {
	authUser := middleware.GetAuthUser(c)

	var input AdminUserCreateInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "bad_request", err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	// Check if email is already taken
	var existingUser models.User
	if err := models.DB.First(&existingUser, "email = ?", input.Email).Error; err == nil {
		return utils.ErrorResponse(c, fiber.StatusConflict, "email_taken", nil)
	}

	hashedPassword, err := utils.HashPassword(input.Password)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_hash_password", err)
	}

	user := models.User{
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Email:     input.Email,
		Password:  hashedPassword,
		Role:      input.Role,
		CompanyID: authUser.User.CompanyID,
	}

	if err := models.DB.Create(&user).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_create_user", err)
	}

	return utils.SuccessResponse(c, fiber.StatusCreated, "user_created", ToProfileResponse(&user))
}

func UpdateUser(c *fiber.Ctx) error {
	authUser := middleware.GetAuthUser(c)
	userID := c.Params("id")

	var input AdminUserUpdateInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "bad_request", err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	var user models.User
	if err := models.DB.First(&user, "id = ? AND company_id = ?", userID, authUser.User.CompanyID).Error; err != nil {
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
	user.Role = input.Role

	if err := models.DB.Save(&user).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_update_user", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "user_updated", ToProfileResponse(&user))
}
