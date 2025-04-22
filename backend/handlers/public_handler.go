package handler

import (
	"errors"
	"live-chat-server/interfaces"
	"live-chat-server/repositories"
	"live-chat-server/utils"

	"github.com/gofiber/fiber/v2"
)

type PublicHandler struct {
	inboxRepo   repositories.InboxRepository
	logger      interfaces.Logger
	langContext interfaces.LanguageContext
}

func NewPublicHandler(inboxRepo repositories.InboxRepository, logger interfaces.Logger, langContext interfaces.LanguageContext) *PublicHandler {
	return &PublicHandler{
		inboxRepo:   inboxRepo,
		logger:      logger,
		langContext: langContext,
	}
}

func (h *PublicHandler) HandleGetInboxDetails(c *fiber.Ctx) error {
	inboxID := c.Params("id")

	inbox, err := h.inboxRepo.GetInboxByID(inboxID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, h.langContext.T(c, "inbox_not_found"), err)
	}

	// Check if the inbox is enabled
	if !inbox.Enabled {
		return utils.ErrorResponse(c, fiber.StatusNotFound, h.langContext.T(c, "inbox_not_found"), errors.New("inbox is not enabled"))
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "inbox_details_retrieved"), inbox.ToResponse())
}
