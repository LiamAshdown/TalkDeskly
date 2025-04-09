package listeners

import (
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/types"
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
	l.dispatcher.Subscribe(interfaces.EventTypeConversationStart, l.HandleConversationStart)
	l.dispatcher.Subscribe(interfaces.EventTypeConversationSendMessage, l.HandleConversationSendMessage)
	l.dispatcher.Subscribe(interfaces.EventTypeConversationGetByID, l.HandleConversationGetByID)
}

func (l *ConversationListener) HandleConversationStart(event interfaces.Event) {
	if conversation, ok := event.Payload.(*models.Conversation); ok {
		websocket.BroadcastConversationStart(conversation)
	}
}

func (l *ConversationListener) HandleConversationSendMessage(event interfaces.Event) {
	if conversation, ok := event.Payload.(*models.Conversation); ok {
		websocket.BroadcastConversationSendMessage(conversation)
		websocket.BroadcastConversationUpdate(conversation)
	}
}

func (l *ConversationListener) HandleConversationGetByID(event interfaces.Event) {
	if payload, ok := event.Payload.(map[string]interface{}); ok {
		if conversation, ok := payload["conversation"].(*models.Conversation); ok {
			if client, ok := payload["client"].(*types.WebSocketClient); ok {
				websocket.BroadcastConversationGetByID(conversation, client)
			}
		}
	}
}
