package handler

import (
	"live-chat-server/interfaces"
	"live-chat-server/types"
	"live-chat-server/websocket"
)

// ConversationStartHandler handles conversation start events from WebSocket
type ConversationStartHandler struct {
	handler *ConversationHandler
}

// HandleMessage implements the types.WebSocketHandler interface
func (h *ConversationStartHandler) HandleMessage(client *types.WebSocketClient, msg *types.WebSocketMessage) {
	h.handler.HandleConversationStart(*client, msg)
}

// NewConversationStartHandler creates a new ConversationStartHandler
func NewConversationStartHandler(handler *ConversationHandler) *ConversationStartHandler {
	return &ConversationStartHandler{handler: handler}
}

// ConversationMessageHandler handles conversation message events from WebSocket
type ConversationMessageHandler struct {
	handler *ConversationHandler
}

// HandleMessage implements the types.WebSocketHandler interface
func (h *ConversationMessageHandler) HandleMessage(client *types.WebSocketClient, msg *types.WebSocketMessage) {
	h.handler.HandleMessage(client, msg)
}

// NewConversationMessageHandler creates a new ConversationMessageHandler
func NewConversationMessageHandler(handler *ConversationHandler) *ConversationMessageHandler {
	return &ConversationMessageHandler{handler: handler}
}

// InitWebSocketHandlers initializes all WebSocket handlers from this package
func InitWebSocketHandlers(wsManager websocket.WebSocketManager, container interfaces.Container) {
	conversationHandler := NewConversationHandler(
		container.GetConversationRepo(),
		container.GetContactRepo(),
		container.GetDispatcher(),
	)

	// Register the conversation start handler
	wsManager.RegisterHandler(types.EventTypeConversationStart, NewConversationStartHandler(conversationHandler))

	// Register the conversation message handler
	wsManager.RegisterHandler(types.EventTypeConversationSendMessage, NewConversationMessageHandler(conversationHandler))

	// Add more handler registrations here as needed
}
