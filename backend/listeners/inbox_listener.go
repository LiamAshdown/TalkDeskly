package listeners

import (
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/types"
)

type InboxListener struct {
	dispatcher interfaces.Dispatcher
	pubSub     interfaces.PubSub
}

func NewInboxListener(dispatcher interfaces.Dispatcher, pubSub interfaces.PubSub) *InboxListener {
	listener := &InboxListener{
		dispatcher: dispatcher,
		pubSub:     pubSub,
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
		l.pubSub.Publish("company:"+inbox.CompanyID, types.EventTypeInboxCreated, inbox)
	}
}

func (l *InboxListener) HandleInboxUpdated(event interfaces.Event) {
	if inbox, ok := event.Payload.(*models.Inbox); ok {
		// Broadcast to company channel
		l.pubSub.Publish("company:"+inbox.CompanyID, types.EventTypeInboxUpdated, inbox)
	}
}

func (l *InboxListener) HandleInboxDeleted(event interfaces.Event) {
	if inbox, ok := event.Payload.(*models.Inbox); ok {
		// Broadcast to company channel
		l.pubSub.Publish("company:"+inbox.CompanyID, types.EventTypeInboxDeleted, inbox)
	}
}
