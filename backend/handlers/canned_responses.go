package handler

import (
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/repositories"
	"live-chat-server/utils"
	"strings"

	"github.com/gofiber/fiber/v2"
)

type CannedResponseHandler struct {
	repo            repositories.CannedResponseRepository
	langContext     interfaces.LanguageContext
	securityContext interfaces.SecurityContext
}

func NewCannedResponseHandler(repo repositories.CannedResponseRepository, langContext interfaces.LanguageContext, securityContext interfaces.SecurityContext) *CannedResponseHandler {
	return &CannedResponseHandler{repo: repo, langContext: langContext, securityContext: securityContext}
}

func (h *CannedResponseHandler) HandleCreateCannedResponse(c *fiber.Ctx) error {
	var input struct {
		Title   string `json:"title" validate:"required"`
		Tag     string `json:"tag" validate:"required"`
		Message string `json:"message" validate:"required,min=10,max=500"`
	}

	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "bad_request"), err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	user := h.securityContext.GetAuthenticatedUser(c)

	cannedResponse := &models.CannedResponse{
		Title:     input.Title,
		Message:   input.Message,
		Tag:       strings.ToLower(input.Tag),
		CompanyID: *user.User.CompanyID,
		UserID:    user.User.ID,
	}

	if err := h.repo.CreateCannedResponse(cannedResponse); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_create_canned_response"), err)
	}

	return utils.SuccessResponse(c, fiber.StatusCreated, h.langContext.T(c, "canned_response_created"), cannedResponse.ToResponse())
}

func (h *CannedResponseHandler) HandleListCannedResponses(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	cannedResponses, err := h.repo.GetCannedResponsesByCompanyID(*user.User.CompanyID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_get_canned_responses"), err)
	}

	cannedResponsesResponse := make([]interface{}, len(cannedResponses))
	for i, cannedResponse := range cannedResponses {
		cannedResponsesResponse[i] = cannedResponse.ToResponse()
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "canned_responses_found"), cannedResponsesResponse)
}

func (h *CannedResponseHandler) HandleUpdateCannedResponse(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	var input struct {
		Title   string `json:"title" validate:"required"`
		Tag     string `json:"tag" validate:"required"`
		Message string `json:"message" validate:"required,min=10,max=500"`
	}

	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "bad_request"), err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	cannedResponse, err := h.repo.GetCannedResponseByIDAndCompanyID(c.Params("id"), *user.User.CompanyID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_get_canned_response"), err)
	}

	cannedResponse.Title = input.Title
	cannedResponse.Tag = input.Tag
	cannedResponse.Message = input.Message

	if err := h.repo.UpdateCannedResponse(cannedResponse); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_update_canned_response"), err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "canned_response_updated"), cannedResponse.ToResponse())
}

func (h *CannedResponseHandler) HandleDeleteCannedResponse(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	cannedResponse, err := h.repo.GetCannedResponseByIDAndCompanyID(c.Params("id"), *user.User.CompanyID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, h.langContext.T(c, "canned_response_not_found"), err)
	}

	if err := h.repo.DeleteCannedResponse(cannedResponse.ID); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_delete_canned_response"), err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "canned_response_deleted"), nil)
}
