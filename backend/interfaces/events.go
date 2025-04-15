package interfaces

// EventType represents the type of event being dispatched
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
	EventTypeConversationAssign      EventType = "conversation_assign"

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

// Event represents a dispatched event
type Event struct {
	Type    EventType
	Payload interface{}
}

// EventHandler is a function that handles an event
type EventHandler func(Event)

// Dispatcher handles event dispatching and subscription
type Dispatcher interface {
	Subscribe(eventType EventType, handler EventHandler)
	Dispatch(eventType EventType, payload interface{})
}
