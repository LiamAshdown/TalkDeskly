package websocket

import (
	"live-chat-server/types"
)

// HandleMessage dispatches a message to the appropriate handler
func HandleMessage(client *Client, msg *types.WebSocketMessage) {
	manager := GetManager()
	if handler, exists := manager.GetHandler(msg.Event); exists {
		wsClient := &types.WebSocketClient{
			Conn:           client.Conn,
			ID:             client.ID,
			Type:           client.Type,
			ConversationID: client.ConversationID,
			CompanyID:      client.CompanyID,
			InboxIDs:       client.InboxIDs,
		}
		handler.HandleMessage(wsClient, msg)
	}
}
