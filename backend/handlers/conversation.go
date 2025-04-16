package handler

import (
	"encoding/json"
	"fmt"
	"live-chat-server/interfaces"
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
	repo            repositories.ConversationRepository
	contactRepo     repositories.ContactRepository
	securityContext interfaces.SecurityContext
	dispatcher      interfaces.Dispatcher
	inboxRepo       repositories.InboxRepository
	logger          interfaces.Logger
	userRepo        repositories.UserRepository
	langContext     interfaces.LanguageContext
}

func NewConversationHandler(repo repositories.ConversationRepository, contactRepo repositories.ContactRepository, securityContext interfaces.SecurityContext, dispatcher interfaces.Dispatcher, inboxRepo repositories.InboxRepository, logger interfaces.Logger, userRepo repositories.UserRepository, langContext interfaces.LanguageContext) *ConversationHandler {
	handlerLogger := logger.Named("conversation_handler")
	return &ConversationHandler{
		repo:            repo,
		contactRepo:     contactRepo,
		securityContext: securityContext,
		dispatcher:      dispatcher,
		inboxRepo:       inboxRepo,
		logger:          handlerLogger,
		userRepo:        userRepo,
		langContext:     langContext,
	}
}

func (h *ConversationHandler) HandleListConversations(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	conversations, err := h.repo.GetConversationsByCompanyID(*user.User.CompanyID, "Contact", "Inbox", "Messages", "AssignedTo")
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_list_conversations"), err)
	}

	payload := make([]types.ConversationPayload, 0)
	for _, conversation := range conversations {
		payload = append(payload, *conversation.ToPayload())
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "conversations_listed"), payload)
}

func (h *ConversationHandler) HandleGetConversation(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	id := c.Params("id")
	if id == "" {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "conversation_id_is_required"), nil)
	}

	conversation, err := h.repo.GetConversationByIdAndCompanyID(c.Params("id"), *user.User.CompanyID, "Inbox", "Contact", "AssignedTo")
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_get_conversation"), err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "conversation_retrieved"), conversation.ToPayload())
}

// SendMessage is a centralized method for sending messages in a conversation
func (h *ConversationHandler) SendMessage(conversation *models.Conversation, senderID string, senderType models.SenderType, content string, messageType models.MessageType, metadata interface{}) error {
	// Convert metadata to JSON string if it's not nil
	var metadataStr *string
	if metadata != nil {
		metadataBytes, err := json.Marshal(metadata)
		if err != nil {
			log.Printf("Error marshaling metadata: %v", err)
		} else {
			str := string(metadataBytes)
			metadataStr = &str
		}
	}

	// Create the new message
	newMessage := models.Message{
		Content:        content,
		Type:           messageType,
		SenderID:       senderID,
		SenderType:     senderType,
		ConversationID: conversation.ID,
		Metadata:       metadataStr,
	}

	// Save the new message
	createdMessage, err := h.repo.CreateMessage(&newMessage)
	if err != nil {
		log.Printf("Error creating message: %v", err)
		return err
	}

	// Update the conversation's last message and timestamp
	conversation.LastMessage = content
	now := time.Now()
	conversation.LastMessageAt = &now

	if err := h.repo.UpdateConversation(conversation); err != nil {
		log.Printf("Error updating conversation: %v", err)
		return err
	}

	createdMessage, err = h.repo.PopulateSender(createdMessage)
	if err != nil {
		log.Printf("Error populating sender: %v", err)
		return err
	}

	// Add the message to the conversation's messages
	conversation.Messages = append(conversation.Messages, *createdMessage)

	// Dispatch the message event
	h.dispatcher.Dispatch(interfaces.EventTypeConversationSendMessage, conversation)

	return nil
}

func (h *ConversationHandler) SendSystemMessage(conversation *models.Conversation, content string) error {
	return h.SendMessage(conversation, "", models.SenderTypeSystem, content, models.MessageTypeText, nil)
}

func (h *ConversationHandler) WSHandleConversationStart(client *types.WebSocketClient, msg *types.WebSocketMessage) {
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

	inbox, err := h.inboxRepo.GetInboxByID(conversationPtr.InboxID)
	if err != nil {
		return
	}

	client.SetConversationID(conversationPtr.ID)

	h.dispatcher.Dispatch(interfaces.EventTypeConversationStart, conversationPtr)

	if inbox.WelcomeMessage != "" {
		err := h.SendMessage(
			conversationPtr,
			client.GetID(),
			models.SenderTypeBot,
			inbox.WelcomeMessage,
			models.MessageTypeText,
			nil,
		)
		if err != nil {
			log.Printf("Error sending welcome message: %v", err)
		}
	}
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

	err = h.SendMessage(
		conversation,
		client.GetID(),
		models.SenderType(client.GetType()),
		payload.Content,
		models.MessageTypeText,
		payload.Metadata,
	)
	if err != nil {
		log.Printf("Error sending message: %v", err)
	}
}

func (h *ConversationHandler) WSHandleConversationTyping(client *types.WebSocketClient, msg *types.WebSocketMessage) {
	var payload types.IncomingConversationTypingPayload
	if err := mapstructure.Decode(msg.Payload, &payload); err != nil {
		return
	}

	conversation, err := h.repo.GetConversationByID(payload.ConversationID)
	if err != nil {
		return
	}

	h.dispatcher.Dispatch(interfaces.EventTypeConversationTyping, conversation)
}

func (h *ConversationHandler) WSHandleConversationTypingStop(client *types.WebSocketClient, msg *types.WebSocketMessage) {
	var payload types.IncomingConversationTypingStopPayload
	if err := mapstructure.Decode(msg.Payload, &payload); err != nil {
		return
	}

	conversation, err := h.repo.GetConversationByID(payload.ConversationID)
	if err != nil {
		return
	}

	h.dispatcher.Dispatch(interfaces.EventTypeConversationTypingStop, conversation)
}

func (h *ConversationHandler) HandleAssignConversation(c *fiber.Ctx) error {
	id := c.Params("id")

	var payload struct {
		AssignedToID string `json:"assigned_to_id"`
	}

	if err := c.BodyParser(&payload); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "failed_to_parse_body", err)
	}

	if id == "" {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "conversation_id_is_required", nil)
	}

	assignedToUser, err := h.userRepo.GetUserByID(payload.AssignedToID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_get_assigned_to_user", err)
	}

	conversation, err := h.repo.GetConversationByID(id, "Contact", "Inbox", "AssignedTo")
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_get_conversation", err)
	}

	conversation.AssignedToID = &assignedToUser.ID
	conversation.AssignedTo = assignedToUser

	if err := h.repo.UpdateConversation(conversation); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_update_conversation", err)
	}

	h.SendSystemMessage(
		conversation,
		fmt.Sprintf("Agent %s has been assigned to this conversation.", h.securityContext.GetAuthenticatedUser(c).User.GetFullName()),
	)

	h.dispatcher.Dispatch(interfaces.EventTypeConversationAssign, conversation)

	return utils.SuccessResponse(c, fiber.StatusOK, "conversation_assigned", conversation.ToPayload())
}

func (h *ConversationHandler) HandleGetAssignableAgents(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	agents, err := h.userRepo.GetUsersByCompanyID(*user.User.CompanyID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_get_agents"), err)
	}

	payload := make([]types.AgentPayload, 0)
	for _, agent := range agents {
		payload = append(payload, types.AgentPayload{
			ID:   agent.ID,
			Name: agent.GetFullName(),
		})
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "agents_retrieved"), payload)
}
