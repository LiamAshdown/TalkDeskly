package listeners

import (
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/websocket"
)

type ConversationListener struct {
	dispatcher interfaces.Dispatcher
}

func NewConversationListener(dispatcher interfaces.Dispatcher) *ConversationListener {
	listener := &ConversationListener{
		dispatcher: dispatcher,
	}
	listener.subscribe()
	return listener
}

func (l *ConversationListener) subscribe() {
	l.dispatcher.Subscribe(interfaces.EventTypeConversationStart, l.handleConversationStart)
}

func (l *ConversationListener) handleConversationStart(event interfaces.Event) {
	if conversation, ok := event.Payload.(*models.Conversation); ok {
		websocket.BroadcastConversationStart(conversation)
	}
}

func (l *ConversationListener) handleConversationSendMessage(event interfaces.Event) {
	if conversation, ok := event.Payload.(*models.Conversation); ok {
		websocket.BroadcastConversationSendMessage(conversation)
	}
}
