package types

import (
	"time"
)

// Event types for WebSocket communication
type EventType string

const (
	// Connection events
	EventTypeConnectionEstablished EventType = "connection_established"

	// Conversation events
	EventTypeConversationStart       EventType = "conversation_start"
	EventTypeConversationSendMessage EventType = "conversation_send_message"

	// Contact events
	EventTypeContactUpdated EventType = "contact_updated"
	EventTypeContactCreated EventType = "contact_created"
	EventTypeContactDeleted EventType = "contact_deleted"

	// Inbox events
	EventTypeInboxUpdated EventType = "inbox_updated"
	EventTypeInboxCreated EventType = "inbox_created"
	EventTypeInboxDeleted EventType = "inbox_deleted"

	// Error events
	EventTypeError EventType = "connection_error"
)

// WebSocketMessage represents the structure of messages sent over WebSocket
type WebSocketMessage struct {
	Event     EventType   `json:"event"`
	Payload   interface{} `json:"payload"`
	Timestamp time.Time   `json:"timestamp"`
}

// NewWebSocketMessage creates a new WebSocket message with the current timestamp
func NewWebSocketMessage(event EventType, payload interface{}) *WebSocketMessage {
	return &WebSocketMessage{
		Event:     event,
		Payload:   payload,
		Timestamp: time.Now(),
	}
}

// MessagePayload represents the payload for a chat message
type IncomingMessagePayload struct {
	ConversationID string      `mapstructure:"conversation_id"`
	Content        string      `mapstructure:"content"`
	Type           string      `mapstructure:"type"`
	Metadata       interface{} `mapstructure:"metadata,omitempty"`
}

type IncomingStartConversationPayload struct {
	InboxID string `mapstructure:"inbox_id"`
}

type IncomingSendMessagePayload struct {
	ConversationID string      `mapstructure:"conversation_id"`
	Content        string      `mapstructure:"content"`
	Type           string      `mapstructure:"type"`
	Metadata       interface{} `mapstructure:"metadata,omitempty"`
}

type OutgoingMessagePayload struct {
	ConversationID string      `json:"conversation_id"`
	Content        string      `json:"content"`
	Type           string      `json:"type"`
	Metadata       interface{} `json:"metadata,omitempty"`
	SenderID       string      `json:"sender_id"`
	SenderType     string      `json:"sender_type"`
}

type OutgoingCreateConversationPayload struct {
	InboxID        string `json:"inbox_id"`
	ConversationID string `json:"conversation_id"`
	Status         string `json:"status"`
	Contact        struct {
		ID    string `json:"id"`
		Name  string `json:"name"`
		Email string `json:"email"`
		Phone string `json:"phone"`
	} `json:"contact"`
	Agent struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"agent"`
	Inbox struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"inbox"`
}

type OutGoingInboxCreatedPayload struct {
	InboxID string `json:"inbox_id"`
	Name    string `json:"name"`
}

type OutgoingSendMessagePayload struct {
	ConversationID string      `json:"conversation_id"`
	Content        string      `json:"content"`
	SenderID       string      `json:"sender_id"`
	SenderType     string      `json:"sender_type"`
	Type           string      `json:"type"`
	Metadata       interface{} `json:"metadata,omitempty"`
}
