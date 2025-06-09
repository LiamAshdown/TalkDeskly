package handler

import (
	"errors"
	"live-chat-server/config"
	"live-chat-server/interfaces"
	"live-chat-server/repositories"
	"live-chat-server/utils"

	"github.com/gofiber/fiber/v2"
)

type PublicHandler struct {
	inboxRepo        repositories.InboxRepository
	logger           interfaces.Logger
	langContext      interfaces.LanguageContext
	conversationRepo repositories.ConversationRepository
	config           config.ConfigManager
}

func NewPublicHandler(inboxRepo repositories.InboxRepository, conversationRepo repositories.ConversationRepository, logger interfaces.Logger, langContext interfaces.LanguageContext, config config.ConfigManager) *PublicHandler {
	return &PublicHandler{
		inboxRepo:        inboxRepo,
		logger:           logger,
		langContext:      langContext,
		conversationRepo: conversationRepo,
		config:           config,
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

func (h *PublicHandler) HandleGetConversationDetails(c *fiber.Ctx) error {
	conversationID := c.Params("id")
	contactID := c.Params("contact_id")

	conversation, err := h.conversationRepo.GetConversationByID(conversationID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, h.langContext.T(c, "conversation_not_found"), err)
	}

	if conversation.ContactID != contactID {
		return utils.ErrorResponse(c, fiber.StatusNotFound, h.langContext.T(c, "conversation_not_found"), errors.New("conversation not found"))
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "conversation_details_retrieved"), conversation.ToPayloadWithoutPrivateMessages())
}

func (h *PublicHandler) AppInformation(c *fiber.Ctx) error {
	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "app_information_retrieved"), fiber.Map{
		"app_name": h.config.GetConfig().ApplicationName,
		"version":  h.config.GetConfig().Version,
	})
}
