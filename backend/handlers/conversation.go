package handler

import (
	"fmt"
	"live-chat-server/interfaces"
	"live-chat-server/listeners"
	"live-chat-server/models"
	"live-chat-server/repositories"
	"live-chat-server/types"
	"live-chat-server/utils"

	"github.com/gofiber/fiber/v2"
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
	uploadService   interfaces.UploadService
	pubSub          interfaces.PubSub
}

func NewConversationHandler(repo repositories.ConversationRepository, contactRepo repositories.ContactRepository,
	securityContext interfaces.SecurityContext, dispatcher interfaces.Dispatcher,
	inboxRepo repositories.InboxRepository, logger interfaces.Logger,
	userRepo repositories.UserRepository, langContext interfaces.LanguageContext,
	uploadService interfaces.UploadService, pubSub interfaces.PubSub) *ConversationHandler {
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
		uploadService:   uploadService,
		pubSub:          pubSub,
	}
}

func (h *ConversationHandler) HandleListConversations(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	conversations, err := h.repo.GetConversationsForUser(user.User.ID, "Contact", "Inbox", "AssignedTo")
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_list_conversations"), err)
	}

	payload := make([]types.ConversationPayload, 0)
	for _, conversation := range conversations {
		payload = append(payload, *conversation.ToPayloadWithoutMessages())
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
func (h *ConversationHandler) SendMessage(conversation *models.Conversation, senderID *string, senderType models.SenderType, content string, messageType models.MessageType, metadata interface{}, private bool) error {
	// Create internal message payload
	internalMessage := &listeners.InternalMessagePayload{
		ConversationID: conversation.ID,
		Content:        content,
		Type:           string(messageType),
		Metadata:       metadata,
		Private:        private,
	}

	// Set sender information
	internalMessage.Sender.Type = types.SenderType(string(senderType))
	if senderID != nil {
		internalMessage.Sender.ID = *senderID
	}

	// Create message payload
	messagePayload := map[string]interface{}{
		"message":      internalMessage,
		"conversation": conversation,
	}

	// Dispatch the event for the listener to handle
	h.dispatcher.Dispatch(interfaces.EventTypeConversationSendMessage, messagePayload)

	return nil
}

func (h *ConversationHandler) SendSystemMessage(conversation *models.Conversation, content string) error {
	return h.SendMessage(conversation, nil, models.SenderTypeSystem, content, models.MessageTypeText, nil, false)
}

func (h *ConversationHandler) SendMessageAttachment(conversation *models.Conversation, senderID *string, senderType models.SenderType, uploadResult *types.UploadResult) error {
	return h.SendMessage(conversation, senderID, senderType, uploadResult.Path, models.MessageTypeFile, uploadResult, false)
}

func (h *ConversationHandler) HandleGetConversationMessages(c *fiber.Ctx) error {
	id := c.Params("id")
	authUser := h.securityContext.GetAuthenticatedUser(c)

	if id == "" {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "conversation_id_is_required"), nil)
	}

	conversation, err := h.repo.GetConversationByIdAndCompanyID(id, *authUser.User.CompanyID, "Messages")
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_get_conversation"), err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "conversation_messages_retrieved"), conversation.GetMessages())
}

// AssignConversation assigns a conversation to a specified agent
// Can be used for both manual and automatic assignment
func (h *ConversationHandler) AssignConversation(conversation *models.Conversation, agentID string, agentName string) error {

	// Don't assign if the conversation is closed
	if conversation.Status != models.ConversationStatusClosed {
		conversation.Status = models.ConversationStatusActive
	}

	conversation.AssignedToID = &agentID

	// Get the agent
	agent, err := h.userRepo.GetUserByID(agentID)
	if err != nil {
		return err
	}
	conversation.AssignedTo = agent

	if err := h.repo.UpdateConversation(conversation); err != nil {
		return err
	}

	// Send system message
	h.SendSystemMessage(
		conversation,
		fmt.Sprintf("Agent %s has been assigned to this conversation.", agentName),
	)

	// Dispatch event
	h.dispatcher.Dispatch(interfaces.EventTypeConversationAssign, conversation)

	return nil
}

func (h *ConversationHandler) HandleAssignConversation(c *fiber.Ctx) error {
	id := c.Params("id")

	var payload struct {
		AssignedToID string `json:"assigned_to_id"`
	}

	if err := c.BodyParser(&payload); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "failed_to_parse_body"), err)
	}

	if id == "" {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "conversation_id_is_required"), nil)
	}

	assignedToUser, err := h.userRepo.GetUserByID(payload.AssignedToID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_get_assigned_to_user"), err)
	}

	conversation, err := h.repo.GetConversationByID(id, "Contact", "Inbox", "AssignedTo")
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_get_conversation"), err)
	}

	if conversation.AssignedToID != nil && *conversation.AssignedToID == assignedToUser.ID {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "conversation_already_assigned"), nil)
	}

	// Use the common method
	if err := h.AssignConversation(conversation, assignedToUser.ID, h.securityContext.GetAuthenticatedUser(c).User.GetFullName()); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_update_conversation"), err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "conversation_assigned"), conversation.ToPayload())
}

func (h *ConversationHandler) HandleGetAssignableAgents(c *fiber.Ctx) error {
	id := c.Params("id")

	if id == "" {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "conversation_id_is_required"), nil)
	}

	conversation, err := h.repo.GetConversationByID(id, "Inbox")
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_get_conversation"), err)
	}

	users, err := h.inboxRepo.GetUsersForInbox(conversation.InboxID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_get_users"), err)
	}

	payload := make([]types.AgentPayload, 0)
	for _, user := range users {
		payload = append(payload, types.AgentPayload{
			ID:     user.ID,
			Name:   user.GetFullName(),
			Avatar: user.GetAvatar(),
		})
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "agents_retrieved"), payload)
}

func (h *ConversationHandler) handleCloseConversation(id string) (*models.Conversation, error) {
	conversation, err := h.repo.GetConversationByID(id, "Contact", "Inbox", "AssignedTo")
	if err != nil {
		return nil, err
	}

	conversation.Status = models.ConversationStatusClosed

	if err := h.repo.UpdateConversation(conversation); err != nil {
		return nil, err
	}

	h.SendSystemMessage(conversation, "This conversation has been closed.")

	h.dispatcher.Dispatch(interfaces.EventTypeConversationClose, conversation)

	return conversation, nil
}

func (h *ConversationHandler) HandleCloseConversation(c *fiber.Ctx) error {
	id := c.Params("id")

	if id == "" {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "conversation_id_is_required"), nil)
	}

	conversation, err := h.handleCloseConversation(id)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_get_conversation"), err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "conversation_closed"), conversation.ToPayload())
}

func (h *ConversationHandler) HandleSendMessageAttachment(c *fiber.Ctx) error {
	conversationID := c.FormValue("conversation_id")
	senderType := c.FormValue("sender_type")
	senderID := c.FormValue("sender_id")

	if conversationID == "" || senderType == "" || senderID == "" {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "missing_required_fields"), nil)
	}

	conversation, err := h.repo.GetConversationByID(conversationID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_get_conversation"), err)
	}

	// Verify the sender exists
	if senderType == string(types.SenderTypeContact) {
		_, err = h.contactRepo.GetContactByID(senderID)
	} else {
		_, err = h.userRepo.GetUserByID(senderID)
	}

	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_get_sender"), err)
	}

	var senderIDPtr *string
	if senderType == string(types.SenderTypeContact) {
		senderIDPtr = &senderID
	} else {
		senderIDPtr = &senderID
	}

	oneOrMoreFailed := false

	// Get the form files
	form, err := c.MultipartForm()
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "failed_to_parse_form"), err)
	}

	files := form.File["files"]
	if len(files) == 0 {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "no_files_provided"), nil)
	}

	for _, file := range files {
		uploadResult, err := h.uploadService.UploadFile(file, "conversation-attachments/"+conversationID)
		if err != nil {
			oneOrMoreFailed = true
			continue
		}

		err = h.SendMessageAttachment(conversation, senderIDPtr, models.SenderType(senderType), uploadResult)
		if err != nil {
			oneOrMoreFailed = true
			continue
		}
	}

	message := h.langContext.T(c, "files_uploaded")

	if oneOrMoreFailed {
		message = h.langContext.T(c, "failed_to_upload_files")
	}

	return utils.SuccessResponse(c, fiber.StatusCreated, message, nil)
}
