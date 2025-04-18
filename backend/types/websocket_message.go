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
	EventTypeConversationGetByID     EventType = "conversation_get_by_id"
	EventTypeConversationUpdate      EventType = "conversation_update"
	EventTypeConversationTyping      EventType = "conversation_typing"
	EventTypeConversationTypingStop  EventType = "conversation_typing_stop"
	EventTypeConversationClose       EventType = "conversation_close"

	// Contact events
	EventTypeContactUpdated     EventType = "contact_updated"
	EventTypeContactCreated     EventType = "contact_created"
	EventTypeContactDeleted     EventType = "contact_deleted"
	EventTypeContactNoteCreated EventType = "contact_note_created"
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

type IncomingCloseConversationPayload struct {
	ConversationID string `mapstructure:"conversation_id"`
}

type IncomingSendMessagePayload struct {
	ConversationID string      `mapstructure:"conversation_id"`
	Content        string      `mapstructure:"content"`
	Type           string      `mapstructure:"type"`
	Private        bool        `mapstructure:"private,omitempty"`
	Metadata       interface{} `mapstructure:"metadata,omitempty"`
}

type IncomingGetConversationByIDPayload struct {
	ConversationID string `mapstructure:"conversation_id"`
}

type IncomingConversationTypingPayload struct {
	ConversationID string `mapstructure:"conversation_id"`
}

type IncomingConversationTypingStopPayload struct {
	ConversationID string `mapstructure:"conversation_id"`
}

type OutgoingMessagePayload struct {
	ConversationID string      `json:"conversation_id"`
	Content        string      `json:"content"`
	Type           string      `json:"type"`
	Metadata       interface{} `json:"metadata,omitempty"`
	SenderID       string      `json:"sender_id"`
	SenderType     string      `json:"sender_type"`
}

type OutgoingCreateConversationPayload = ConversationPayload

type OutGoingInboxCreatedPayload struct {
	InboxID string `json:"inbox_id"`
	Name    string `json:"name"`
	Type    string `json:"type"`
}

type OutgoingSendMessagePayload struct {
	ID             string      `json:"id"`
	ConversationID string      `json:"conversation_id"`
	Name           string      `json:"name"`
	Content        string      `json:"content"`
	Sender         Sender      `json:"sender"`
	Type           string      `json:"type"`
	Metadata       interface{} `json:"metadata,omitempty"`
	Timestamp      string      `json:"timestamp"`
	Private        bool        `json:"private,omitempty"`
}

// OutgoingGetConversationByIDPayload is now using ConversationPayload type
type OutgoingGetConversationByIDPayload = ConversationPayload
