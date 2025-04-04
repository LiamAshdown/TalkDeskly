package handler

import (
	"live-chat-server/interfaces"
	"live-chat-server/middleware"
	"live-chat-server/models"
	"live-chat-server/repositories"
	"live-chat-server/types"
	"live-chat-server/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/mitchellh/mapstructure"
)

type ConversationHandler struct {
	repo        repositories.ConversationRepository
	contactRepo repositories.ContactRepository
	dispatcher  interfaces.Dispatcher
}

func NewConversationHandler(repo repositories.ConversationRepository, contactRepo repositories.ContactRepository, dispatcher interfaces.Dispatcher) *ConversationHandler {
	return &ConversationHandler{repo: repo, contactRepo: contactRepo, dispatcher: dispatcher}
}

func (h *ConversationHandler) HandleListConversations(c *fiber.Ctx) error {
	user := middleware.GetAuthUser(c)

	conversations, err := h.repo.GetConversationsByCompanyID(*user.User.CompanyID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_list_conversations", err)
	}

	payload := make([]types.ConversationPayload, 0)
	for _, conversation := range conversations {
		payload = append(payload, *conversation.ToPayload())
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "conversations_listed", payload)
}

func (h *ConversationHandler) HandleConversationStart(client types.WebSocketClient, msg *types.WebSocketMessage) {
	var payload types.IncomingStartConversationPayload
	if err := mapstructure.Decode(msg.Payload, &payload); err != nil {
		return
	}

	conversation := models.Conversation{
		InboxID:   payload.InboxID,
		ContactID: client.GetID(),
		CompanyID: client.GetCompanyID(),
		Status:    models.ConversationStatusPending,
	}

	if err := models.DB.Create(&conversation).Error; err != nil {
		return
	}

	conversationPtr, err := h.repo.GetConversationByID(conversation.ID, "Inbox", "Contact", "AssignedTo")
	if err != nil {
		return
	}

	// Use the dispatcher instead of directly calling websocket function
	h.dispatcher.Dispatch(interfaces.EventTypeConversationStart, conversationPtr)
}

func (h *ConversationHandler) HandleMessage(client *types.WebSocketClient, msg *types.WebSocketMessage) {
	var payload types.IncomingSendMessagePayload
	if err := mapstructure.Decode(msg.Payload, &payload); err != nil {
		return
	}

	conversation, err := h.repo.GetConversationByID(payload.ConversationID, "Inbox", "Contact", "AssignedTo")
	if err != nil {
		return
	}

	conversation.Messages = append(conversation.Messages, models.Message{
		Content:    payload.Content,
		Type:       models.MessageTypeText,
		SenderID:   client.GetID(),
		SenderType: models.SenderTypeContact,
		Metadata:   "",
	})
	conversation.LastMessage = payload.Content
	now := time.Now()
	conversation.LastMessageAt = &now

	if err := h.repo.UpdateConversation(conversation); err != nil {
		return
	}

	// Reload the conversation
	conversation, err = h.repo.GetConversationByID(payload.ConversationID, "Inbox", "Contact", "AssignedTo")
	if err != nil {
		return
	}

	// Use the dispatcher to notify about the message
	h.dispatcher.Dispatch(interfaces.EventTypeConversationSendMessage, conversation)
}
