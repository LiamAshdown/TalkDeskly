package handler

import (
	"live-chat-server/interfaces"
	"live-chat-server/types"
	"live-chat-server/websocket"
)

// ConversationHandlerFunc is a function type that handles conversation events
type ConversationHandlerFunc func(client *types.WebSocketClient, msg *types.WebSocketMessage)

// ConversationHandlerWrapper wraps a conversation handler function
type ConversationHandlerWrapper struct {
	handlerFunc ConversationHandlerFunc
}

// HandleMessage implements the types.WebSocketHandler interface
func (h *ConversationHandlerWrapper) HandleMessage(client *types.WebSocketClient, msg *types.WebSocketMessage) {
	h.handlerFunc(client, msg)
}

// NewConversationEventHandler creates a new handler for a specific conversation event type
func NewConversationEventHandler(handler *ConversationHandler, eventType types.EventType) *ConversationHandlerWrapper {
	var handlerFunc ConversationHandlerFunc

	switch eventType {
	case types.EventTypeConversationStart:
		handlerFunc = func(client *types.WebSocketClient, msg *types.WebSocketMessage) {
			handler.WSHandleConversationStart(*client, msg)
		}
	case types.EventTypeConversationSendMessage:
		handlerFunc = func(client *types.WebSocketClient, msg *types.WebSocketMessage) {
			handler.WSHandleMessage(client, msg)
		}
	case types.EventTypeConversationGetByID:
		handlerFunc = func(client *types.WebSocketClient, msg *types.WebSocketMessage) {
			handler.WSHandleGetConversationByID(client, msg)
		}
	}

	return &ConversationHandlerWrapper{handlerFunc: handlerFunc}
}

// InitWebSocketHandlers initializes all WebSocket handlers from this package
func InitWebSocketHandlers(wsManager websocket.WebSocketManager, container interfaces.Container) {
	conversationHandler := NewConversationHandler(
		container.GetConversationRepo(),
		container.GetContactRepo(),
		container.GetDispatcher(),
	)

	// Register handlers for all conversation event types
	eventTypes := []types.EventType{
		types.EventTypeConversationStart,
		types.EventTypeConversationSendMessage,
		types.EventTypeConversationGetByID,
	}

	for _, eventType := range eventTypes {
		wsManager.RegisterHandler(eventType, NewConversationEventHandler(conversationHandler, eventType))
	}
}
