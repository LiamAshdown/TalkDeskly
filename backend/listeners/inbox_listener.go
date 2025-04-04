package listeners

import (
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/types"
	"live-chat-server/websocket"
)

type InboxListener struct {
	dispatcher interfaces.Dispatcher
}

func NewInboxListener(dispatcher interfaces.Dispatcher) *InboxListener {
	listener := &InboxListener{
		dispatcher: dispatcher,
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
		websocket.BroadcastToCompanyAgents(inbox.CompanyID, types.EventTypeInboxCreated, inbox.ToPayload())
	}
}

func (l *InboxListener) HandleInboxUpdated(event interfaces.Event) {
	if payload, ok := event.Payload.(*types.InboxUpdatedPayload); ok {
		if inbox, ok := payload.Inbox.(*models.Inbox); ok {
			websocket.BroadcastToCompanyAgents(inbox.CompanyID, types.EventTypeInboxUpdated, inbox.ToPayload())

			for _, userID := range payload.RemovedUserIDs {
				websocket.BroadcastToAgent(userID, types.EventTypeInboxDeleted, types.InboxDeletedPayload{
					ID: inbox.ID,
				})
			}
		}
	}
}

func (l *InboxListener) HandleInboxDeleted(event interfaces.Event) {
	// if inbox, ok := event.Payload.(*models.Inbox); ok {
	// 	websocket.BroadcastInboxDeleted(inbox)
	// }
}
