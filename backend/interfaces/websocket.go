package interfaces

import (
	"live-chat-server/types"
)

// WebSocketService handles WebSocket client initialization and management
type WebSocketService interface {
	InitializeClient(c *types.WebSocketConn, userID, userType, companyID string) *types.WebSocketClient
}

// PubSub defines the interface for publish-subscribe functionality
type PubSub interface {
	Subscribe(client *types.WebSocketClient, topic string)
	Unsubscribe(client *types.WebSocketClient, topic string)
	UnsubscribeAll(client *types.WebSocketClient)
	Publish(topic string, event types.EventType, payload interface{})
	GetSubscribers(topic string) []*types.WebSocketClient
	GetTopics() []string
}
