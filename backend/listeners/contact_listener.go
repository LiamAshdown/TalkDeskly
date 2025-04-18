package listeners

import (
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/types"
	"live-chat-server/websocket"
)

type ContactListener struct {
	dispatcher interfaces.Dispatcher
	wsHandler  *websocket.WebSocketHandler
}

func NewContactListener(dispatcher interfaces.Dispatcher, wsHandler *websocket.WebSocketHandler) *ContactListener {
	listener := &ContactListener{
		dispatcher: dispatcher,
		wsHandler:  wsHandler,
	}
	listener.subscribe()
	return listener
}

func (l *ContactListener) subscribe() {
	l.dispatcher.Subscribe(interfaces.EventTypeContactCreated, l.handleContactCreated)
	l.dispatcher.Subscribe(interfaces.EventTypeContactUpdated, l.handleContactUpdated)
	l.dispatcher.Subscribe(interfaces.EventTypeContactDeleted, l.handleContactDeleted)
	l.dispatcher.Subscribe(interfaces.EventTypeContactNoteCreated, l.handleContactNoteCreated)
}

func (l *ContactListener) handleContactCreated(event interfaces.Event) {
	if contact, ok := event.Payload.(*models.Contact); ok {
		l.wsHandler.BroadcastToCompanyAgents(contact.CompanyID, types.EventTypeContactCreated, contact.ToPayload())
	}
}

func (l *ContactListener) handleContactUpdated(event interfaces.Event) {
	if contact, ok := event.Payload.(*models.Contact); ok {
		l.wsHandler.BroadcastToCompanyAgents(contact.CompanyID, types.EventTypeContactUpdated, contact.ToPayload())
	}
}

func (l *ContactListener) handleContactDeleted(event interfaces.Event) {
	if contact, ok := event.Payload.(*models.Contact); ok {
		l.wsHandler.BroadcastToCompanyAgents(contact.CompanyID, types.EventTypeContactDeleted, contact.ToPayload())
	}
}

func (l *ContactListener) handleContactNoteCreated(event interfaces.Event) {
	if note, ok := event.Payload.(map[string]interface{}); ok {
		l.wsHandler.BroadcastToCompanyAgents(note["companyID"].(string), types.EventTypeContactNoteCreated, note["note"])
	}
}
