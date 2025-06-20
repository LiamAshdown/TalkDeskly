package handler

import (
	"live-chat-server/commands"
	"live-chat-server/interfaces"
	"live-chat-server/listeners"
	"live-chat-server/models"
	"live-chat-server/repositories"
	"live-chat-server/types"
	"live-chat-server/utils"

	"github.com/gofiber/websocket/v2"
	"github.com/mitchellh/mapstructure"
	"go.uber.org/dig"
)

// WebSocketHandler handles WebSocket connections
type WebSocketHandler struct {
	websocketService    interfaces.WebSocketService
	pubSub              interfaces.PubSub
	dispatcher          interfaces.Dispatcher
	logger              interfaces.Logger
	securityContext     interfaces.SecurityContext
	conversationRepo    repositories.ConversationRepository
	inboxRepo           repositories.InboxRepository
	contactRepo         repositories.ContactRepository
	userRepo            repositories.UserRepository
	conversationHandler *ConversationHandler
	commandFactory      interfaces.CommandFactory
}

// WebSocketHandlerParams contains dependencies for WebSocketHandler
type WebSocketHandlerParams struct {
	dig.In
	WebsocketService    interfaces.WebSocketService
	PubSub              interfaces.PubSub
	Dispatcher          interfaces.Dispatcher
	Logger              interfaces.Logger
	SecurityContext     interfaces.SecurityContext
	ConversationRepo    repositories.ConversationRepository
	InboxRepo           repositories.InboxRepository
	ContactRepo         repositories.ContactRepository
	UserRepo            repositories.UserRepository
	ConversationHandler *ConversationHandler
	CommandFactory      interfaces.CommandFactory
}

// NewWebSocketHandler creates a new WebSocketHandler
func NewWebSocketHandler(params WebSocketHandlerParams) *WebSocketHandler {
	return &WebSocketHandler{
		websocketService:    params.WebsocketService,
		pubSub:              params.PubSub,
		dispatcher:          params.Dispatcher,
		logger:              params.Logger,
		securityContext:     params.SecurityContext,
		conversationRepo:    params.ConversationRepo,
		inboxRepo:           params.InboxRepo,
		contactRepo:         params.ContactRepo,
		userRepo:            params.UserRepo,
		conversationHandler: params.ConversationHandler,
		commandFactory:      params.CommandFactory,
	}
}

// HandleAgentWebSocket handles WebSocket connections from agents
func (h *WebSocketHandler) HandleAgentWebSocket(c *websocket.Conn) {
	// Extract user ID and token from the connection
	userID := c.Params("user_id")

	user, err := h.userRepo.GetUserByID(userID)
	if err != nil || user.CompanyID == nil {
		h.logger.Error("Failed to get company ID for agent", "error", err, "user_id", userID)
		c.Close()
		return
	}

	// Initialize client
	client := h.websocketService.InitializeClient(c, userID, "agent", *user.CompanyID)

	// Handle incoming messages
	h.handleMessages(client)
}

// HandleContactWebSocket handles WebSocket connections from contacts
func (h *WebSocketHandler) HandleContactWebSocket(c *websocket.Conn) {
	// Extract contact ID from the connection
	contactID := c.Query("contact_id")
	inboxID := c.Query("inbox_id")

	if inboxID == "" {
		h.logger.Error("Inbox ID is required", "contact_id", contactID)
		c.WriteJSON(types.WebSocketMessage{
			Event:   types.EventTypeError,
			Payload: map[string]string{"message": "Inbox ID is required. Have you correctly configured the widget?", "code": "SERVER_ERROR"},
		})
		c.Close()
		return
	}

	inbox, err := h.inboxRepo.GetInboxByID(inboxID)
	if err != nil {
		h.logger.Error("Failed to get inbox", "error", err, "inbox_id", inboxID)
		c.WriteJSON(types.WebSocketMessage{
			Event:   types.EventTypeError,
			Payload: map[string]string{"message": "Failed to get inbox. Have you correctly configured the widget?", "code": "SERVER_ERROR"},
		})
		c.Close()
		return
	}

	var contact *models.Contact

	if contactID == "" {
		contactName := utils.GenerateRandomName()
		contact = &models.Contact{
			ID:        contactID,
			CompanyID: inbox.CompanyID,
			Name:      &contactName,
		}

		if err := h.contactRepo.CreateContact(contact); err != nil {
			h.logger.Error("Failed to create contact", "error", err, "contact_id", contactID)
			c.Close()
			return
		}
	} else {
		contact, err = h.contactRepo.GetContactByID(contactID)
		if err != nil {
			h.logger.Error("Failed to get contact", "error", err, "contact_id", contactID)
			c.Close()
			return
		}
	}

	// Initialize client
	client := h.websocketService.InitializeClient(c, contact.ID, "contact", contact.CompanyID)

	// Handle incoming messages
	h.handleMessages(client)
}

// handleMessages handles incoming WebSocket messages
func (h *WebSocketHandler) handleMessages(client *types.WebSocketClient) {
	// Read messages from the WebSocket connection
	for {
		var msg types.WebSocketMessage
		if err := client.Conn.ReadJSON(&msg); err != nil {
			h.pubSub.UnsubscribeAll(client)
			h.logger.Info("WebSocket connection closed", "client_id", client.GetID(), "error", err.Error())
			break
		}

		h.logger.Info("Received WebSocket message", "event", msg.Event, "client_id", client.GetID())

		// Handle different event types
		switch msg.Event {
		case types.EventTypeConversationSendMessage:
			h.HandleConversationSendMessage(client, &msg)
		case types.EventTypeConversationStart:
			h.HandleConversationStart(client, &msg)
		case types.EventTypeConversationGetByID:
			h.HandleConversationGetByID(client, &msg)
		case types.EventTypeConversationTyping:
			h.HandleConversationTyping(client, &msg)
		case types.EventTypeConversationTypingStop:
			h.HandleConversationTypingStop(client, &msg)
		case types.EventTypeConversationClose:
			h.HandleConversationClose(client, &msg)
		case types.EventTypeSubscribe:
			h.HandleSubscribe(client, &msg)
		case types.EventTypeUnsubscribe:
			h.HandleUnsubscribe(client, &msg)
		default:
			h.logger.Warn("Unknown WebSocket event", "event", msg.Event, "client_id", client.GetID())
		}
	}
}

// HandleConversationStart handles the conversation start event
func (h *WebSocketHandler) HandleConversationStart(client *types.WebSocketClient, msg *types.WebSocketMessage) {
	var payload types.IncomingStartConversationPayload
	if err := mapstructure.Decode(msg.Payload, &payload); err != nil {
		client.SendError("Invalid payload", "INVALID_PAYLOAD")
		return
	}

	// Create and execute StartConversation command
	startCmd := h.commandFactory.NewStartConversationCommand(client, &payload)
	inbox, err := startCmd.Handle()
	if err != nil {
		h.logger.Error("Failed to start conversation", "error", err)
		client.SendError("Failed to start conversation", "SERVER_ERROR")
		return
	}

	// Get the concrete command to access its fields
	cmd := startCmd.(*commands.StartConversationCommand)

	// Handle pre-chat form if present
	if payload.PreChatFormData != nil {
		formCmd := h.commandFactory.NewHandlePreChatFormCommand(client, cmd.Conversation, payload.PreChatFormData)
		_, err := formCmd.Handle()
		if err != nil {
			h.logger.Error("Failed to handle pre-chat form", "error", err)
			client.SendError("Failed to handle pre-chat form", "SERVER_ERROR")
			return
		}
	}

	// Handle inbox features
	inboxCmd := h.commandFactory.NewHandleInboxFeaturesCommand(cmd.Conversation, inbox.(*models.Inbox))
	_, err = inboxCmd.Handle()
	if err != nil {
		h.logger.Error("Failed to handle inbox features", "error", err)
		client.SendError("Failed to handle inbox features", "SERVER_ERROR")
		return
	}

	h.pubSub.Subscribe(client, "conversation:"+cmd.Conversation.ID)

	h.dispatcher.Dispatch(interfaces.EventTypeConversationStart, cmd.Conversation)
}

// HandleConversationGetByID handles getting a conversation by ID
func (h *WebSocketHandler) HandleConversationGetByID(client *types.WebSocketClient, msg *types.WebSocketMessage) {
	var payload types.IncomingGetConversationByIDPayload
	if err := mapstructure.Decode(msg.Payload, &payload); err != nil {
		client.SendError("Invalid payload", "INVALID_PAYLOAD")
		return
	}

	conversation, err := h.conversationRepo.GetConversationByID(payload.ConversationID, "Messages", "Inbox", "Contact", "AssignedTo")
	if err != nil {
		client.SendError("Failed to get conversation", "SERVER_ERROR")
		return
	}

	// Subscribe to the conversation
	h.pubSub.Subscribe(client, "conversation:"+payload.ConversationID)

	h.dispatcher.Dispatch(interfaces.EventTypeConversationGetByID, map[string]interface{}{
		"conversation": conversation,
		"client":       client,
	})
}

// HandleConversationSendMessage handles sending a message
func (h *WebSocketHandler) HandleConversationSendMessage(client *types.WebSocketClient, msg *types.WebSocketMessage) {
	var payload types.IncomingSendMessagePayload
	if err := mapstructure.Decode(msg.Payload, &payload); err != nil {
		client.SendError("Invalid payload", "INVALID_PAYLOAD")
		return
	}

	conversation, err := h.conversationRepo.GetConversationByID(payload.ConversationID, "Messages", "Inbox", "Contact", "AssignedTo")
	if err != nil {
		client.SendError("Failed to get conversation", "SERVER_ERROR")
		return
	}

	if conversation.IsClosed() {
		return
	}

	var private bool = false
	if payload.Private && client.IsAgent() {
		private = true
	}

	// Create internal message payload
	internalMessage := &listeners.InternalMessagePayload{
		ConversationID: payload.ConversationID,
		Content:        payload.Content,
		Type:           payload.Type,
		Metadata:       payload.Metadata,
		Private:        private,
	}
	internalMessage.Sender.ID = client.GetID()
	internalMessage.Sender.Type = getSenderType(client.GetType())

	// Create a structured payload for the dispatcher
	messagePayload := map[string]interface{}{
		"message":      internalMessage,
		"conversation": conversation,
	}

	h.dispatcher.Dispatch(interfaces.EventTypeConversationSendMessage, messagePayload)
}

// HandleConversationTyping handles the typing indicator
func (h *WebSocketHandler) HandleConversationTyping(client *types.WebSocketClient, msg *types.WebSocketMessage) {
	var payload types.IncomingConversationTypingPayload
	if err := mapstructure.Decode(msg.Payload, &payload); err != nil {
		client.SendError("Invalid payload", "INVALID_PAYLOAD")
		return
	}

	conversation, err := h.conversationRepo.GetConversationByID(payload.ConversationID)
	if err != nil {
		client.SendError("Failed to get conversation", "SERVER_ERROR")
		return
	}

	typingData := map[string]interface{}{
		"conversation_id": payload.ConversationID,
		"user_id":         client.GetID(),
		"user_type":       client.GetType(),
	}

	// Publish typing event to conversation channel
	h.pubSub.Publish("conversation:"+payload.ConversationID, types.EventTypeConversationTyping, typingData)

	h.dispatcher.Dispatch(interfaces.EventTypeConversationTyping, conversation)
}

// HandleConversationTypingStop handles when typing stops
func (h *WebSocketHandler) HandleConversationTypingStop(client *types.WebSocketClient, msg *types.WebSocketMessage) {
	var payload types.IncomingConversationTypingStopPayload
	if err := mapstructure.Decode(msg.Payload, &payload); err != nil {
		client.SendError("Invalid payload", "INVALID_PAYLOAD")
		return
	}

	conversation, err := h.conversationRepo.GetConversationByID(payload.ConversationID)
	if err != nil {
		client.SendError("Failed to get conversation", "SERVER_ERROR")
		return
	}

	typingStopData := map[string]interface{}{
		"conversation_id": payload.ConversationID,
		"user_id":         client.GetID(),
		"user_type":       client.GetType(),
	}

	h.pubSub.Publish("conversation:"+payload.ConversationID, types.EventTypeConversationTypingStop, typingStopData)

	h.dispatcher.Dispatch(interfaces.EventTypeConversationTypingStop, conversation)
}

// HandleConversationClose handles closing a conversation
func (h *WebSocketHandler) HandleConversationClose(client *types.WebSocketClient, msg *types.WebSocketMessage) {
	var payload types.IncomingCloseConversationPayload
	if err := mapstructure.Decode(msg.Payload, &payload); err != nil {
		client.SendError("Invalid payload", "INVALID_PAYLOAD")
		return
	}

	conversation, err := h.conversationRepo.GetConversationByID(payload.ConversationID, "Contact", "Inbox", "AssignedTo")
	if err != nil {
		client.SendError("Failed to get conversation", "SERVER_ERROR")
		return
	}

	conversation.Status = models.ConversationStatusClosed

	if err := h.conversationRepo.UpdateConversation(conversation); err != nil {
		client.SendError("Failed to close conversation", "SERVER_ERROR")
		return
	}

	h.SendSystemMessage(conversation, "This conversation has been closed.")

	h.dispatcher.Dispatch(interfaces.EventTypeConversationClose, conversation)
}

// SendSystemMessage sends a system message to a conversation
func (h *WebSocketHandler) SendSystemMessage(conversation *models.Conversation, content string) {
	internalMessage := &listeners.InternalMessagePayload{
		ConversationID: conversation.ID,
		Content:        content,
		Type:           "text",
	}
	internalMessage.Sender.ID = "system"
	internalMessage.Sender.Type = types.SenderTypeSystem

	messagePayload := map[string]interface{}{
		"message":      internalMessage,
		"conversation": conversation,
	}

	h.dispatcher.Dispatch(interfaces.EventTypeConversationSendMessage, messagePayload)
}

func (h *WebSocketHandler) SendBotMessage(conversation *models.Conversation, content string) {
	internalMessage := &listeners.InternalMessagePayload{
		ConversationID: conversation.ID,
		Content:        content,
		Type:           "text",
	}
	internalMessage.Sender.ID = ""
	internalMessage.Sender.Type = types.SenderTypeBot

	messagePayload := map[string]interface{}{
		"message":      internalMessage,
		"conversation": conversation,
	}

	h.dispatcher.Dispatch(interfaces.EventTypeConversationSendMessage, messagePayload)
}

func (h *WebSocketHandler) HandleSubscribe(client *types.WebSocketClient, msg *types.WebSocketMessage) {
	var payload types.IncomingSubscribePayload
	if err := mapstructure.Decode(msg.Payload, &payload); err != nil {
		client.SendError("Invalid payload", "INVALID_PAYLOAD")
		return
	}

	h.pubSub.Subscribe(client, payload.Topic)
}

func (h *WebSocketHandler) HandleUnsubscribe(client *types.WebSocketClient, msg *types.WebSocketMessage) {
	var payload types.IncomingUnsubscribePayload
	if err := mapstructure.Decode(msg.Payload, &payload); err != nil {
		client.SendError("Invalid payload", "INVALID_PAYLOAD")
		return
	}

	h.pubSub.Unsubscribe(client, payload.Topic)
}

// getSenderType converts a string type to a SenderType
func getSenderType(senderType string) types.SenderType {
	switch senderType {
	case "agent":
		return types.SenderTypeAgent
	case "contact":
		return types.SenderTypeContact
	case "bot":
		return types.SenderTypeBot
	case "system":
		return types.SenderTypeSystem
	default:
		return types.SenderTypeSystem
	}
}
