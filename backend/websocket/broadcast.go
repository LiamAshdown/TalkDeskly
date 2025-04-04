package websocket

import (
	"live-chat-server/types"
	"time"
)

// BroadcastToCompanyAgents sends a WebSocket message to all agents in a specific company
func BroadcastToCompanyAgents(companyID string, eventType types.EventType, payload interface{}) {
	if wsManager := GetManager(); wsManager != nil {
		wsManager.BroadcastToCompanyAgents(companyID, &types.WebSocketMessage{
			Event:     eventType,
			Payload:   payload,
			Timestamp: time.Now(),
		})
	}
}

// BroadcastToInboxAgents sends a WebSocket message to all agents with access to a specific inbox
func BroadcastToInboxAgents(inboxID string, eventType types.EventType, payload interface{}) {
	if wsManager := GetManager(); wsManager != nil {
		wsManager.BroadcastToInboxAgents(inboxID, &types.WebSocketMessage{
			Event:     eventType,
			Payload:   payload,
			Timestamp: time.Now(),
		})
	}
}

func BroadcastToAgent(agentID string, eventType types.EventType, payload interface{}) {
	if wsManager := GetManager(); wsManager != nil {
		wsManager.BroadcastToAgent(agentID, &types.WebSocketMessage{
			Event:     eventType,
			Payload:   payload,
			Timestamp: time.Now(),
		})
	}
}

func BroadcastToContact(contactID string, eventType types.EventType, payload interface{}) {
	if wsManager := GetManager(); wsManager != nil {
		wsManager.BroadcastToContact(contactID, &types.WebSocketMessage{
			Event:     eventType,
			Payload:   payload,
			Timestamp: time.Now(),
		})
	}
}
