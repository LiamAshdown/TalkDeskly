package listeners

import (
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/types"
	"live-chat-server/websocket"

	"github.com/gofiber/fiber/v2"
)

type ConversationListener struct {
	dispatcher interfaces.Dispatcher
	wsHandler  *websocket.WebSocketHandler
}

func NewConversationListener(dispatcher interfaces.Dispatcher, wsHandler *websocket.WebSocketHandler) *ConversationListener {
	listener := &ConversationListener{
		dispatcher: dispatcher,
		wsHandler:  wsHandler,
	}
	listener.subscribe()
	return listener
}

func (l *ConversationListener) subscribe() {
	l.dispatcher.Subscribe(interfaces.EventTypeConversationStart, l.HandleConversationStart)
	l.dispatcher.Subscribe(interfaces.EventTypeConversationSendMessage, l.HandleConversationSendMessage)
	l.dispatcher.Subscribe(interfaces.EventTypeConversationGetByID, l.HandleConversationGetByID)
	l.dispatcher.Subscribe(interfaces.EventTypeConversationTyping, l.HandleConversationTyping)
	l.dispatcher.Subscribe(interfaces.EventTypeConversationTypingStop, l.HandleConversationTypingStop)
	l.dispatcher.Subscribe(interfaces.EventTypeConversationAssign, l.HandleConversationAssign)
	l.dispatcher.Subscribe(interfaces.EventTypeConversationClose, l.HandleConversationClose)
}

func (l *ConversationListener) HandleConversationStart(event interfaces.Event) {
	if conversation, ok := event.Payload.(*models.Conversation); ok {
		l.wsHandler.BroadcastConversationStart(conversation)
	}
}

func (l *ConversationListener) HandleConversationSendMessage(event interfaces.Event) {
	if conversation, ok := event.Payload.(*models.Conversation); ok {
		l.wsHandler.BroadcastConversationSendMessage(conversation)

		// We need to also send the conversation update
		// So clients recieves last message and last update
		l.wsHandler.BroadcastConversationUpdate(conversation)
	}
}

func (l *ConversationListener) HandleConversationGetByID(event interfaces.Event) {
	if payload, ok := event.Payload.(map[string]interface{}); ok {
		if conversation, ok := payload["conversation"].(*models.Conversation); ok {
			if client, ok := payload["client"].(*types.WebSocketClient); ok {
				l.wsHandler.BroadcastConversationGetByID(conversation, client)

			}
		}
	}
}

func (l *ConversationListener) HandleConversationTyping(event interfaces.Event) {
	if conversation, ok := event.Payload.(*models.Conversation); ok {
		l.wsHandler.BroadcastToInboxAgents(conversation.InboxID, types.EventTypeConversationTyping, map[string]interface{}{
			"conversation_id": conversation.ID,
		})
	}
}

func (l *ConversationListener) HandleConversationTypingStop(event interfaces.Event) {
	if conversation, ok := event.Payload.(*models.Conversation); ok {
		l.wsHandler.BroadcastToInboxAgents(conversation.InboxID, types.EventTypeConversationTypingStop, map[string]interface{}{
			"conversation_id": conversation.ID,
		})
	}
}

func (l *ConversationListener) HandleConversationAssign(event interfaces.Event) {
	if conversation, ok := event.Payload.(*models.Conversation); ok {
		l.wsHandler.BroadcastToInboxAgents(conversation.InboxID, types.EventTypeConversationUpdate, conversation.ToPayloadWithoutMessages())
	}
}

func (l *ConversationListener) HandleConversationClose(event interfaces.Event) {
	if conversation, ok := event.Payload.(*models.Conversation); ok {
		l.wsHandler.BroadcastToCompanyAgents(conversation.InboxID, types.EventTypeConversationClose, conversation.ToPayloadWithoutMessages())

		l.wsHandler.BroadcastToContact(conversation.ContactID, types.EventTypeConversationClose, fiber.Map{
			"conversation_id": conversation.ID,
			"status":          string(conversation.Status),
		})
	}
}
