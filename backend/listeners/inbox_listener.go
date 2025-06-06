package listeners

import (
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/services"
	"live-chat-server/types"

	"go.uber.org/dig"
)

type InboxListener struct {
	dispatcher   interfaces.Dispatcher
	pubSub       interfaces.PubSub
	auditService services.AuditService
}

type InboxPayload struct {
	Inbox *models.Inbox
	User  *models.User
}

type InboxUpdatedPayload struct {
	Inbox          *models.Inbox
	RemovedUserIDs *[]string
	User           *models.User
}

// InboxListenerParams contains dependencies for InboxListener
type InboxListenerParams struct {
	dig.In
	Dispatcher   interfaces.Dispatcher
	PubSub       interfaces.PubSub
	AuditService services.AuditService
}

func NewInboxListener(params InboxListenerParams) *InboxListener {
	listener := &InboxListener{
		dispatcher:   params.Dispatcher,
		pubSub:       params.PubSub,
		auditService: params.AuditService,
	}
	listener.subscribe()
	return listener
}

func (l *InboxListener) subscribe() {
	l.dispatcher.Subscribe(interfaces.EventTypeInboxCreated, l.HandleInboxCreated)
	l.dispatcher.Subscribe(interfaces.EventTypeInboxUpdated, l.HandleInboxUpdated)
	l.dispatcher.Subscribe(interfaces.EventTypeInboxDeleted, l.HandleInboxDeleted)
}

func (l *InboxListener) HandleInboxCreated(event interfaces.Event) {
	if inbox, ok := event.Payload.(InboxPayload); ok {
		// Broadcast to company channel
		l.pubSub.Publish("company:"+inbox.Inbox.CompanyID, types.EventTypeInboxCreated, inbox.Inbox.ToPayload())

		l.auditService.LogUserAction(
			inbox.User.ID,
			string(models.AuditActionInboxCreate),
			"inbox",
			inbox.Inbox.ID,
			"Inbox created",
			nil,
		)
	}
}

func (l *InboxListener) HandleInboxUpdated(event interfaces.Event) {
	if payload, ok := event.Payload.(*InboxUpdatedPayload); ok {
		inbox := payload.Inbox
		// removedUserIDs := payload.RemovedUserIDs
		user := payload.User

		// Broadcast to company channel
		l.pubSub.Publish("company:"+inbox.CompanyID, types.EventTypeInboxUpdated, inbox.ToPayload())

		l.auditService.LogUserAction(
			user.ID,
			string(models.AuditActionInboxUpdate),
			"inbox",
			inbox.ID,
			"Inbox updated",
			nil,
		)
	}
}

func (l *InboxListener) HandleInboxDeleted(event interfaces.Event) {
	if inbox, ok := event.Payload.(InboxPayload); ok {
		inboxID := inbox.Inbox.ID
		user := inbox.User

		// Broadcast to company channel
		l.pubSub.Publish("company:"+inboxID, types.EventTypeInboxDeleted, map[string]interface{}{
			"inbox_id": inboxID,
		})

		l.auditService.LogUserAction(
			user.ID,
			string(models.AuditActionInboxDelete),
			"inbox",
			inboxID,
			"Inbox deleted",
			nil,
		)
	}
}
