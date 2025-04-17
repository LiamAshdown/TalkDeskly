package websocket

import (
	"live-chat-server/types"
	"time"
)

// BroadcastToCompanyAgents sends a WebSocket message to all agents in a specific company
func (h *WebSocketHandler) BroadcastToCompanyAgents(companyID string, eventType types.EventType, payload interface{}) {
	message := &types.WebSocketMessage{
		Event:     eventType,
		Payload:   payload,
		Timestamp: time.Now(),
	}
	h.manager.BroadcastToCompanyAgents(companyID, message)
}

// BroadcastToInboxAgents sends a WebSocket message to all agents with access to a specific inbox
func (h *WebSocketHandler) BroadcastToInboxAgents(inboxID string, eventType types.EventType, payload interface{}) {
	message := &types.WebSocketMessage{
		Event:     eventType,
		Payload:   payload,
		Timestamp: time.Now(),
	}
	h.manager.BroadcastToInboxAgents(inboxID, message)
}

func (h *WebSocketHandler) BroadcastToAgent(agentID string, eventType types.EventType, payload interface{}) {
	message := &types.WebSocketMessage{
		Event:     eventType,
		Payload:   payload,
		Timestamp: time.Now(),
	}
	h.manager.BroadcastToAgent(agentID, message)
}

func (h *WebSocketHandler) BroadcastToContact(contactID string, eventType types.EventType, payload interface{}) {
	message := &types.WebSocketMessage{
		Event:     eventType,
		Payload:   payload,
		Timestamp: time.Now(),
	}
	h.manager.BroadcastToContact(contactID, message)
}
