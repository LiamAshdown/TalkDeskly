package handler

import (
	"live-chat-server/middleware"
	"live-chat-server/models"
	"live-chat-server/repositories"
	"live-chat-server/utils"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type UserInput struct {
	FirstName string `json:"first_name" validate:"required,min=3,max=255"`
	LastName  string `json:"last_name" validate:"required,min=3,max=255"`
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=8"`
}

type OnboardingHandler struct {
	userRepo    repositories.UserRepository
	companyRepo repositories.CompanyRepository
}

func NewOnboardingHandler(userRepo repositories.UserRepository, companyRepo repositories.CompanyRepository) *OnboardingHandler {
	return &OnboardingHandler{userRepo: userRepo, companyRepo: companyRepo}
}

func (h *OnboardingHandler) HandleCreateUser(c *fiber.Ctx) error {
	var input UserInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "bad_request", nil)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	// Check if email is already taken
	existingUser, err := h.userRepo.GetUserByEmail(input.Email)
	if err != nil && err != gorm.ErrRecordNotFound {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "user_fetch_failed", err)
	}

	if existingUser != nil {
		return utils.ErrorResponse(c, fiber.StatusConflict, "validation.email_already_taken", nil)
	}

	hashedPassword, err := utils.HashPassword(input.Password)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "password_hash_failed", nil)
	}

	user := models.User{
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Email:     input.Email,
		Password:  hashedPassword,
		Role:      string(models.RoleAdmin),
		NotificationSettings: &models.NotificationSettings{
			NewConversation: true,
			NewMessage:      true,
			Mentions:        true,
			EmailEnabled:    true,
			BrowserEnabled:  false,
		},
	}

	if err := h.userRepo.CreateUser(&user); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "user_creation_failed", err)
	}

	token, err := utils.GenerateJWT(user.ID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "token_generation_failed", err)
	}

	return utils.CreatedResponse(c, "onboarding.user_created", fiber.Map{
		"token": token,
	})
}

func (h *OnboardingHandler) HandleCreateCompany(c *fiber.Ctx) error {
	var input CompanyInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "bad_request", nil)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	existingCompany, err := h.companyRepo.GetCompanyByName(input.Name)
	if err != nil && err != gorm.ErrRecordNotFound {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "company_fetch_failed", err)
	}

	if existingCompany != nil {
		return utils.ErrorResponse(c, fiber.StatusConflict, "validation.company_already_exists", nil)
	}

  existingCompany, err = h.companyRepo.GetCompanyByEmail(input.Email)
  if err != nil && err != gorm.ErrRecordNotFound {
    return utils.ErrorResponse(c, fiber.StatusInternalServerError, "company_fetch_failed", err)
  }

  if existingCompany != nil {
    return utils.ErrorResponse(c, fiber.StatusConflict, "validation.company_already_exists", nil)
  }

	user := middleware.GetAuthUser(c)

	// User cannot create a company if they already have one
	if user.User.CompanyID != nil {
		return utils.ErrorResponse(c, fiber.StatusConflict, "validation.company_already_exists", nil)
	}

	company := models.Company{
		Name:    input.Name,
		Email:   input.Email,
		Website: input.Website,
		Phone:   input.Phone,
		Address: input.Address,
	}

	if err := h.companyRepo.CreateCompany(&company); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "company_creation_failed", err.Error())
	}

	user.User.CompanyID = &company.ID

	if err := h.userRepo.UpdateUser(user.User); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_update_user", err)
	}

	fetchedUser, err := h.userRepo.GetUserByID(user.User.ID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "user_reload_failed", err)
	}

	user.User = fetchedUser

	return utils.CreatedResponse(c, "onboarding.company_created", fiber.Map{
		"user":  user.User,
		"token": user.Token,
	})
}
