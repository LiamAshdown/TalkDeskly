package handler

import (
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/repositories"
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

type UserHandler struct {
	userRepo        repositories.UserRepository
	companyRepo     repositories.CompanyRepository
	securityContext interfaces.SecurityContext
	logger          interfaces.Logger
	i18n            interfaces.I18n
	langContext     interfaces.LanguageContext
}

func NewUserHandler(userRepo repositories.UserRepository, companyRepo repositories.CompanyRepository, securityContext interfaces.SecurityContext, logger interfaces.Logger, i18n interfaces.I18n, langContext interfaces.LanguageContext) *UserHandler {
	// Create a named logger for the user handler
	handlerLogger := logger.Named("user_handler")

	return &UserHandler{
		userRepo:        userRepo,
		companyRepo:     companyRepo,
		securityContext: securityContext,
		logger:          handlerLogger,
		i18n:            i18n,
		langContext:     langContext,
	}
}

func (h *UserHandler) GetUsers(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	users, err := h.userRepo.GetUsersByCompanyID(*user.User.CompanyID)
	if err != nil {
		h.logger.Error("Failed to fetch users", fiber.Map{
			"company_id": *user.User.CompanyID,
			"error":      err.Error(),
		})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_fetch_users"), err)
	}

	var response []interface{}
	for _, user := range users {
		response = append(response, user.ToResponse())
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "users_found"), response)
}

func (h *UserHandler) GetUser(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)
	userID := c.Params("id")

	var userModel models.User
	if err := models.DB.Preload("NotificationSettings").First(&userModel, "id = ? AND company_id = ?", userID, *user.User.CompanyID).Error; err != nil {
		h.logger.Error("User not found", fiber.Map{
			"user_id":    userID,
			"company_id": *user.User.CompanyID,
			"error":      err.Error(),
		})
		return utils.ErrorResponse(c, fiber.StatusNotFound, h.langContext.T(c, "user_not_found"), err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "user_found"), userModel.ToResponse())
}

func (h *UserHandler) CreateCompanyUser(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	var input AdminUserCreateInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "bad_request"), err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	// Check if email is already taken
	_, err := h.userRepo.GetUserByEmail(input.Email)
	if err == nil {
		h.logger.Warn("Email already taken", fiber.Map{
			"email": input.Email,
		})
		return utils.ErrorResponse(c, fiber.StatusConflict, h.langContext.T(c, "email_taken"), nil)
	}

	hashedPassword, err := h.securityContext.HashPassword(input.Password)
	if err != nil {
		h.logger.Error("Failed to hash password", fiber.Map{
			"error": err.Error(),
		})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_hash_password"), err)
	}

	newUser := models.User{
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Email:     input.Email,
		Password:  hashedPassword,
		Role:      input.Role,
		CompanyID: user.User.CompanyID,
		NotificationSettings: &models.NotificationSettings{
			NewConversation: true,
			NewMessage:      true,
			Mentions:        true,
			EmailEnabled:    true,
			BrowserEnabled:  false,
		},
	}

	createdUser, err := h.userRepo.CreateUser(&newUser)
	if err != nil {
		h.logger.Error("Failed to create user", fiber.Map{
			"error": err.Error(),
		})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_create_user"), err)
	}

	h.logger.Info("User created", fiber.Map{
		"user_id": createdUser.ID,
		"email":   createdUser.Email,
	})

	return utils.SuccessResponse(c, fiber.StatusCreated, h.langContext.T(c, "user_created"), createdUser.ToResponse())
}

func (h *UserHandler) UpdateUser(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)
	userID := c.Params("id")

	var input AdminUserUpdateInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "bad_request"), err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	userToUpdate, err := h.userRepo.GetUserByID(userID)
	if err != nil {
		h.logger.Error("User not found", fiber.Map{
			"user_id":    userID,
			"company_id": *user.User.CompanyID,
			"error":      err.Error(),
		})
		return utils.ErrorResponse(c, fiber.StatusNotFound, h.langContext.T(c, "user_not_found"), err)
	}

	// Check if the user belongs to the right company
	if userToUpdate.CompanyID == nil || *userToUpdate.CompanyID != *user.User.CompanyID {
		h.logger.Warn("User not in same company", fiber.Map{
			"user_id":    userID,
			"company_id": *user.User.CompanyID,
		})
		return utils.ErrorResponse(c, fiber.StatusNotFound, h.langContext.T(c, "user_not_found"), nil)
	}

	// Check if email is already taken by another user
	if input.Email != userToUpdate.Email {
		existingUser, err := h.userRepo.GetUserByEmail(input.Email)
		if err == nil && existingUser.ID != userToUpdate.ID {
			h.logger.Warn("Email already taken", fiber.Map{
				"email": input.Email,
			})
			return utils.ErrorResponse(c, fiber.StatusConflict, h.langContext.T(c, "email_taken"), nil)
		}
	}

	userToUpdate.FirstName = input.FirstName
	userToUpdate.LastName = input.LastName
	userToUpdate.Email = input.Email
	userToUpdate.Role = input.Role

	if err := h.userRepo.UpdateUser(userToUpdate); err != nil {
		h.logger.Error("Failed to update user", fiber.Map{
			"user_id": userID,
			"error":   err.Error(),
		})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_update_user"), err)
	}

	h.logger.Info("User updated", fiber.Map{
		"user_id": userToUpdate.ID,
	})

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "user_updated"), userToUpdate.ToResponse())
}
