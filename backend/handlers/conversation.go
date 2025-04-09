package handler

import (
	"encoding/json"
	"live-chat-server/interfaces"
	"live-chat-server/middleware"
	"live-chat-server/models"
	"live-chat-server/repositories"
	"live-chat-server/types"
	"live-chat-server/utils"
	"log"
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

	conversations, err := h.repo.GetConversationsByCompanyID(*user.User.CompanyID, "Contact", "Inbox", "Messages")
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_list_conversations", err)
	}

	payload := make([]types.ConversationPayload, 0)
	for _, conversation := range conversations {
		payload = append(payload, *conversation.ToPayload())
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "conversations_listed", payload)
}

func (h *ConversationHandler) HandleGetConversation(c *fiber.Ctx) error {
	user := middleware.GetAuthUser(c)

	id := c.Params("id")
	if id == "" {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "conversation_id_is_required", nil)
	}

	conversation, err := h.repo.GetConversationByIdAndCompanyID(c.Params("id"), *user.User.CompanyID, "Inbox", "Contact", "AssignedTo")
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_get_conversation", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "conversation_retrieved", conversation.ToPayload())
}

func (h *ConversationHandler) WSHandleConversationStart(client types.WebSocketClient, msg *types.WebSocketMessage) {
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

	if err := h.repo.CreateConversation(&conversation); err != nil {
		return
	}

	conversationPtr, err := h.repo.GetConversationByID(conversation.ID, "Messages", "Inbox", "Contact", "AssignedTo")
	if err != nil {
		return
	}

	// Use the dispatcher instead of directly calling websocket function
	h.dispatcher.Dispatch(interfaces.EventTypeConversationStart, conversationPtr)
}

func (h *ConversationHandler) WSHandleGetConversationByID(client *types.WebSocketClient, msg *types.WebSocketMessage) {
	var payload types.IncomingGetConversationByIDPayload
	if err := mapstructure.Decode(msg.Payload, &payload); err != nil {
		return
	}

	conversation, err := h.repo.GetConversationByID(payload.ConversationID, "Messages", "Inbox", "Contact", "AssignedTo")
	if err != nil {
		return
	}

	h.dispatcher.Dispatch(interfaces.EventTypeConversationGetByID, map[string]interface{}{
		"conversation": conversation,
		"client":       client,
	})
}

func (h *ConversationHandler) WSHandleMessage(client *types.WebSocketClient, msg *types.WebSocketMessage) {
	var payload types.IncomingSendMessagePayload
	if err := mapstructure.Decode(msg.Payload, &payload); err != nil {
		return
	}

	conversation, err := h.repo.GetConversationByID(payload.ConversationID, "Messages", "Inbox", "Contact", "AssignedTo")
	if err != nil {
		return
	}

	// Convert metadata to JSON string if it's not nil
	var metadataStr *string
	if payload.Metadata != nil {
		metadataBytes, err := json.Marshal(payload.Metadata)
		if err != nil {
			log.Printf("Error marshaling metadata: %v", err)
		} else {
			str := string(metadataBytes)
			metadataStr = &str
		}
	}

	newMessage := models.Message{
		Content:        payload.Content,
		Type:           models.MessageTypeText,
		SenderID:       client.GetID(),
		SenderType:     models.SenderType(client.GetType()),
		ConversationID: conversation.ID,
		Metadata:       metadataStr,
	}

	// Save the new message
	if err := h.repo.CreateMessage(&newMessage); err != nil {
		log.Printf("Error creating message: %v", err)
		return
	}

	// Update the conversation's last message and timestamp
	conversation.LastMessage = payload.Content
	now := time.Now()
	conversation.LastMessageAt = &now

	if err := h.repo.UpdateConversation(conversation); err != nil {
		log.Printf("Error updating conversation: %v", err)
		return
	}

	// Reload the conversation
	conversation, err = h.repo.GetConversationByID(payload.ConversationID, "Messages", "Inbox", "Contact", "AssignedTo")
	if err != nil {
		return
	}

	// Use the dispatcher to notify about the message
	h.dispatcher.Dispatch(interfaces.EventTypeConversationSendMessage, conversation)
}
