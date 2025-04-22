package handler

import (
	"live-chat-server/config"
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/repositories"
	"live-chat-server/services"
	"live-chat-server/utils"
	"time"

	"live-chat-server/email"

	"fmt"

	"github.com/gofiber/fiber/v2"
)

var imageUploadService = services.NewImageUploadService(services.DefaultImageConfig)

type CompanyInput struct {
	Name    string `json:"name" validate:"required,min=2,max=255"`
	Email   string `json:"email" validate:"required,email"`
	Website string `json:"website" validate:"omitempty,url"`
	Phone   string `json:"phone" validate:"omitempty,min=5,max=50"`
	Address string `json:"address" validate:"omitempty,min=5,max=500"`
	Logo    string `json:"logo"`
}

type SendInviteInput struct {
	Emails []string `json:"emails" validate:"required"`
}

type CompanyHandler struct {
	repo            repositories.CompanyRepository
	userRepo        repositories.UserRepository
	dispatcher      interfaces.Dispatcher
	jobClient       interfaces.JobClient
	emailProvider   email.EmailProvider
	securityContext interfaces.SecurityContext
	logger          interfaces.Logger
	i18n            interfaces.I18n
	langContext     interfaces.LanguageContext
}

func NewCompanyHandler(repo repositories.CompanyRepository, userRepo repositories.UserRepository, dispatcher interfaces.Dispatcher, jobClient interfaces.JobClient, emailProvider email.EmailProvider, securityContext interfaces.SecurityContext, logger interfaces.Logger, i18n interfaces.I18n, langContext interfaces.LanguageContext) *CompanyHandler {
	// Create a named logger for the company handler
	handlerLogger := logger.Named("company_handler")

	return &CompanyHandler{
		repo:            repo,
		userRepo:        userRepo,
		dispatcher:      dispatcher,
		jobClient:       jobClient,
		emailProvider:   emailProvider,
		securityContext: securityContext,
		logger:          handlerLogger,
		i18n:            i18n,
		langContext:     langContext,
	}
}

func (h *CompanyHandler) GetCompany(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	h.logger.Debug("Getting company", fiber.Map{
		"user_id":    user.User.ID,
		"company_id": *user.User.CompanyID,
	})

	company, err := h.repo.GetCompanyByID(*user.User.CompanyID)
	if err != nil {
		h.logger.Error("Failed to get company", fiber.Map{
			"user_id":    user.User.ID,
			"company_id": *user.User.CompanyID,
			"error":      err.Error(),
		})
		return utils.ErrorResponse(c, fiber.StatusNotFound, h.langContext.T(c, "company_not_found"), err)
	}

	h.logger.Info("Company found", fiber.Map{
		"company_id":   company.ID,
		"company_name": company.Name,
	})

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "company_found"), company.ToResponse())
}

func (h *CompanyHandler) UpdateCompany(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	var input CompanyInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "bad_request"), err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	company, err := h.repo.GetCompanyByID(*user.User.CompanyID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, h.langContext.T(c, "company_not_found"), err)
	}

	company.Name = input.Name
	company.Email = input.Email
	company.Website = input.Website
	company.Phone = input.Phone
	company.Address = input.Address

	if err := h.repo.UpdateCompany(company); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_update_company"), err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "company_updated"), company.ToResponse())
}

func (h *CompanyHandler) UploadCompanyLogo(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	// Upload the file
	filename, err := imageUploadService.UploadFile(c, "logo", "company-logos")
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "file_upload_failed"), err)
	}

	// Update company logo in database
	company, err := h.repo.GetCompanyByID(*user.User.CompanyID)
	if err != nil {
		// Clean up the uploaded file if company not found
		imageUploadService.DeleteFile(filename, "company-logos")
		return utils.ErrorResponse(c, fiber.StatusNotFound, h.langContext.T(c, "company_not_found"), err)
	}

	// Delete old logo if exists
	if err := imageUploadService.DeleteFile(company.Logo, "company-logos"); err != nil {
		// Log the error but continue with the update
		// The old file might have been already deleted
	}

	company.Logo = filename
	if err := h.repo.UpdateCompany(company); err != nil {
		// Clean up the uploaded file if database update fails
		imageUploadService.DeleteFile(filename, "company-logos")
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_update_company_logo"), err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "logo_uploaded"), company.ToResponse())
}

func (h *CompanyHandler) SendInvite(c *fiber.Ctx) error {
	var input SendInviteInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "bad_request"), err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	authUser := h.securityContext.GetAuthenticatedUser(c)

	for _, email := range input.Emails {
		// Is it a valid email?
		if !utils.IsEmailValid(email) {
			continue
		}

		_, err := h.userRepo.GetUserByEmail(email)
		if err == nil {
			continue
		}

		_, err = h.repo.GetCompanyInviteByEmail(email)
		if err == nil {
			continue
		}

		token := utils.GenerateRandomString(32)

		// Create the accept URL
		acceptURL := fmt.Sprintf("%s/auth/invite/%s", config.App.FrontendURL, token)

		invite := models.CompanyInvite{
			CompanyID: *authUser.User.CompanyID,
			Email:     email,
			UserID:    authUser.User.ID,
			Token:     token,
			ExpiresAt: time.Now().Add(time.Hour * 24 * 7),
		}

		if err := h.repo.CreateCompanyInvite(&invite); err != nil {
			return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_create_invite"), err)
		}

		payload := map[string]interface{}{
			"email":       email,
			"company_id":  *authUser.User.CompanyID,
			"sender_name": fmt.Sprintf("%s %s", authUser.User.FirstName, authUser.User.LastName),
			"accept_url":  acceptURL,
		}

		if err := h.jobClient.Enqueue("send_invite", payload); err != nil {
			return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_enqueue_invite"), err)
		}
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "invite_sent"), nil)
}

func (h *CompanyHandler) GetInvites(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	invites, err := h.repo.GetCompanyInvites(*user.User.CompanyID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_get_invites"), err)
	}

	payload := make([]interface{}, len(invites))

	for i, invite := range invites {
		payload[i] = invite.ToResponse()
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "invites_found"), payload)
}

func (h *CompanyHandler) GetInvite(c *fiber.Ctx) error {
	token := c.Params("token")

	invite, err := h.repo.GetCompanyInviteByToken(token)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, h.langContext.T(c, "invite_not_found"), err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "invite_found"), invite.ToResponse())
}

func (h *CompanyHandler) GetTeamMembers(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	members, err := h.userRepo.GetUsersByCompanyID(*user.User.CompanyID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_get_team_members"), err)
	}

	invites, err := h.repo.GetCompanyInvites(*user.User.CompanyID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_get_team_members"), err)
	}

	teamMembers := make([]interface{}, len(members)+len(invites))

	type TeamMember struct {
		ID        string    `json:"id"`
		Name      string    `json:"name"`
		Email     string    `json:"email"`
		Avatar    string    `json:"avatar,omitempty"`
		Role      string    `json:"role"`
		Status    string    `json:"status"`
		CreatedAt time.Time `json:"created_at"`
		UpdatedAt time.Time `json:"updated_at"`
	}

	for i, member := range members {
		teamMembers[i] = TeamMember{
			ID:        member.ID,
			Name:      member.GetFullName(),
			Email:     member.Email,
			Avatar:    member.GetAvatar(),
			Role:      member.Role,
			Status:    "Active",
			CreatedAt: member.CreatedAt,
			UpdatedAt: member.UpdatedAt,
		}
	}

	for i, invite := range invites {
		teamMembers[len(members)+i] = TeamMember{
			ID:        invite.ID,
			Name:      invite.Email,
			Email:     invite.Email,
			Role:      "agent",
			Status:    "Invited",
			CreatedAt: invite.CreatedAt,
			UpdatedAt: invite.UpdatedAt,
		}
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "team_members_found"), teamMembers)
}

func (h *CompanyHandler) ResendInvite(c *fiber.Ctx) error {
	id := c.Params("id")

	invite, err := h.repo.GetCompanyInviteByID(id)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, h.langContext.T(c, "invite_not_found"), nil)
	}

	acceptURL := fmt.Sprintf("%s/auth/invite/%s", config.App.FrontendURL, invite.Token)

	payload := map[string]interface{}{
		"email":       invite.Email,
		"company_id":  invite.CompanyID,
		"sender_name": fmt.Sprintf("%s %s", invite.User.FirstName, invite.User.LastName),
		"accept_url":  acceptURL,
	}

	if err := h.jobClient.Enqueue("send_invite", payload); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_enqueue_invite"), err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "invite_resent"), nil)
}

func (h *CompanyHandler) CreateTeamMember(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	var input struct {
		FirstName string `json:"first_name" validate:"required,min=2,max=255"`
		LastName  string `json:"last_name" validate:"required,min=2,max=255"`
		Email     string `json:"email" validate:"required,email"`
		Role      string `json:"role" validate:"required,oneof=admin agent"`
	}

	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "bad_request"), err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	_, err := h.userRepo.GetUserByEmail(input.Email)
	if err == nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "user_already_exists"), nil)
	}

	password := utils.GenerateRandomString(16)

	newUser := models.User{
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Email:     input.Email,
		Role:      input.Role,
		CompanyID: user.User.CompanyID,
		Password:  password,
	}

	if _, err := h.userRepo.CreateUser(&newUser); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_create_user"), err)
	}

	// Generate accept URL for the new user
	acceptURL := fmt.Sprintf("%s/auth/login", config.App.FrontendURL)

	payload := fiber.Map{
		"email":        newUser.Email,
		"inviter_name": fmt.Sprintf("%s %s", user.User.FirstName, user.User.LastName),
		"accept_url":   acceptURL,
		"password":     password,
	}

	if err := h.jobClient.Enqueue("send_user_credentials", payload); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_enqueue_user_credentials"), err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "user_created"), fiber.Map{
		"id":         newUser.ID,
		"name":       newUser.GetFullName(),
		"email":      newUser.Email,
		"role":       newUser.Role,
		"status":     "Active",
		"created_at": newUser.CreatedAt,
		"updated_at": newUser.UpdatedAt,
	})
}
