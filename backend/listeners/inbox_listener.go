package listeners

import (
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/types"

	"go.uber.org/dig"
)

type InboxListener struct {
	dispatcher interfaces.Dispatcher
	pubSub     interfaces.PubSub
}

// InboxListenerParams contains dependencies for InboxListener
type InboxListenerParams struct {
	dig.In
	Dispatcher interfaces.Dispatcher
	PubSub     interfaces.PubSub
}

func NewInboxListener(params InboxListenerParams) *InboxListener {
	listener := &InboxListener{
		dispatcher: params.Dispatcher,
		pubSub:     params.PubSub,
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
	if inbox, ok := event.Payload.(*models.Inbox); ok {
		// Broadcast to company channel
		l.pubSub.Publish("company:"+inbox.CompanyID, types.EventTypeInboxCreated, inbox.ToPayload())
	}
}

func (l *InboxListener) HandleInboxUpdated(event interfaces.Event) {
	if inbox, ok := event.Payload.(*models.Inbox); ok {
		// Broadcast to company channel
		l.pubSub.Publish("company:"+inbox.CompanyID, types.EventTypeInboxUpdated, inbox.ToPayload())
	}
}

func (l *InboxListener) HandleInboxDeleted(event interfaces.Event) {
	if inboxID, ok := event.Payload.(string); ok {
		// Broadcast to company channel
		l.pubSub.Publish("company:"+inboxID, types.EventTypeInboxDeleted, map[string]interface{}{
			"inbox_id": inboxID,
		})
	}
}
