package listeners

import (
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/types"
)

type ContactListener struct {
	dispatcher interfaces.Dispatcher
	pubSub     interfaces.PubSub
}

func NewContactListener(dispatcher interfaces.Dispatcher, pubSub interfaces.PubSub) *ContactListener {
	listener := &ContactListener{
		dispatcher: dispatcher,
		pubSub:     pubSub,
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
		// Broadcast to company channel
		l.pubSub.Publish("company:"+contact.CompanyID, types.EventTypeContactCreated, contact.ToPayload())
	}
}

func (l *ContactListener) handleContactUpdated(event interfaces.Event) {
	if contact, ok := event.Payload.(*models.Contact); ok {
		// Broadcast to company channel
		l.pubSub.Publish("company:"+contact.CompanyID, types.EventTypeContactUpdated, contact.ToPayload())

		// Also broadcast to the contact's personal channel if they exist
		l.pubSub.Publish("contact:"+contact.ID, types.EventTypeContactUpdated, contact.ToPayload())
	}
}

func (l *ContactListener) handleContactDeleted(event interfaces.Event) {
	if contact, ok := event.Payload.(*models.Contact); ok {
		// Broadcast to company channel
		l.pubSub.Publish("company:"+contact.CompanyID, types.EventTypeContactDeleted, contact.ToPayload())
	}
}

func (l *ContactListener) handleContactNoteCreated(event interfaces.Event) {
	if payload, ok := event.Payload.(map[string]interface{}); ok {
		if contact, ok := payload["contact"].(*models.Contact); ok {
			note := payload["note"].(models.ContactNote)
			l.pubSub.Publish("contact:"+contact.ID, types.EventTypeContactNoteCreated, note.ToPayload())
		}
	}
}
