package websocket

import (
	"live-chat-server/types"
	"log"
)

// MiddlewareFunc defines a middleware function for WebSocket handlers
type MiddlewareFunc func(client *types.WebSocketClient, msg *types.WebSocketMessage, next func())

// Middleware holds middlewares that need to be executed before handling a message
var middlewares []MiddlewareFunc

// RegisterMiddleware registers a new middleware function
func RegisterMiddleware(middleware MiddlewareFunc) {
	middlewares = append(middlewares, middleware)
}

// ConversationIDMiddleware updates the client's conversation ID based on the message
func ConversationIDMiddleware(client *types.WebSocketClient, msg *types.WebSocketMessage, next func()) {
	// Check if message contains a conversation_id in its payload
	if payload, ok := msg.Payload.(map[string]interface{}); ok {
		if conversationID, ok := payload["conversation_id"].(string); ok && conversationID != "" {
			// Update client's conversation ID
			if client.ConversationID != conversationID {
				log.Printf("Updating conversation ID for client %s from %s to %s", 
					client.ID, client.ConversationID, conversationID)
				client.SetConversationID(conversationID)
			}
		}
	}

	// Continue to the next middleware or handler
	next()
}

// HandleMessage dispatches a message to the appropriate handler with middleware support
func HandleMessage(client *types.WebSocketClient, msg *types.WebSocketMessage) {
	// Create a middleware chain
	var index int
	var next func()

	next = func() {
		// If we've executed all middlewares, call the actual handler
		if index >= len(middlewares) {
			executeHandler(client, msg)
			return
		}

		// Get current middleware
		middleware := middlewares[index]
		index++

		// Execute middleware
		middleware(client, msg, next)
	}

	// Start the middleware chain
	next()
}

// executeHandler calls the actual handler for the message
func executeHandler(client *types.WebSocketClient, msg *types.WebSocketMessage) {
	manager := GetManager()
	if handler, exists := manager.GetHandler(msg.Event); exists {
		// No need to convert the client since it's already a types.WebSocketClient
		handler.HandleMessage(client, msg)
	}
}
