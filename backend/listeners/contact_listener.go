package listeners

import (
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/types"

	"go.uber.org/dig"
)

type ContactListener struct {
	dispatcher   interfaces.Dispatcher
	pubSub       interfaces.PubSub
	auditService interfaces.AuditService
}

// ContactListenerParams contains dependencies for ContactListener
type ContactListenerParams struct {
	dig.In
	Dispatcher   interfaces.Dispatcher
	PubSub       interfaces.PubSub
	AuditService interfaces.AuditService
}

type ContactCreatedPayload struct {
	Contact *models.Contact
	User    *models.User
}

type ContactUpdatedPayload = ContactCreatedPayload
type ContactDeletedPayload = ContactCreatedPayload

type ContactNoteCreatedPayload struct {
	Contact *models.Contact
	User    *models.User
	Note    *models.ContactNote
}

func NewContactListener(params ContactListenerParams) *ContactListener {
	listener := &ContactListener{
		dispatcher:   params.Dispatcher,
		pubSub:       params.PubSub,
		auditService: params.AuditService,
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
	if payload, ok := event.Payload.(*ContactCreatedPayload); ok {
		contact := payload.Contact
		user := payload.User

		l.auditService.LogUserAction(user.ID, string(models.AuditActionContactCreate), "contact", contact.ID, "Contact created", nil)

		// Broadcast to company channel
		l.pubSub.Publish("company:"+contact.CompanyID, types.EventTypeContactCreated, contact.ToPayload())
	}
}

func (l *ContactListener) handleContactUpdated(event interfaces.Event) {
	if payload, ok := event.Payload.(*ContactUpdatedPayload); ok {
		contact := payload.Contact
		user := payload.User

		l.auditService.LogUserAction(user.ID, string(models.AuditActionContactUpdate), "contact", contact.ID, "Contact updated", nil)

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
	if payload, ok := event.Payload.(*ContactNoteCreatedPayload); ok {
		contact := payload.Contact
		user := payload.User
		note := payload.Note

		l.auditService.LogUserAction(user.ID, string(models.AuditActionContactNoteCreate), "contact", contact.ID, "Contact note created", note.ToPayload())

		l.pubSub.Publish("contact:"+contact.ID, types.EventTypeContactNoteCreated, note.ToPayload())
	}
}
