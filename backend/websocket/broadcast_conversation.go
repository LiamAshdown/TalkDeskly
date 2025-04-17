package websocket

import (
	"live-chat-server/models"
	"live-chat-server/types"
	"time"
)

// BroadcastConversationStart broadcasts a conversation creation event to all agents in the inbox
func (h *WebSocketHandler) BroadcastConversationStart(conversation *models.Conversation) {
	payload := conversation.ToPayload()

	message := &types.WebSocketMessage{
		Event:     types.EventTypeConversationStart,
		Payload:   payload,
		Timestamp: time.Now(),
	}

	h.manager.BroadcastToInboxAgents(conversation.InboxID, message)
	h.manager.BroadcastToContact(conversation.ContactID, message)
}

func (h *WebSocketHandler) BroadcastConversationSendMessage(conversation *models.Conversation) {
	message := conversation.Messages[len(conversation.Messages)-1]

	var sender *types.Sender = nil

	if message.SenderType == models.SenderTypeSystem {
		sender = &types.Sender{
			ID:        "",
			Name:      "System",
			Type:      types.SenderTypeSystem,
			AvatarUrl: "",
		}
	} else {
		sender = &types.Sender{
			ID:        *message.SenderID,
			Name:      message.GetSenderName(),
			Type:      types.SenderType(message.GetSenderType()),
			AvatarUrl: message.GetSenderAvatarUrl(),
		}
	}

	payload := types.OutgoingSendMessagePayload{
		ID:             message.ID,
		ConversationID: conversation.ID,
		Name:           message.GetSenderName(),
		Content:        message.Content,
		Sender:         *sender,
		Type:           string(message.Type),
		Metadata:       message.Metadata,
		Timestamp:      message.CreatedAt.Format("01/02/2006 15:04:05"),
	}

	wsMessage := &types.WebSocketMessage{
		Event:     types.EventTypeConversationSendMessage,
		Payload:   payload,
		Timestamp: time.Now(),
	}

	h.manager.BroadcastToInboxAgents(conversation.InboxID, wsMessage)
	h.manager.BroadcastToContact(conversation.ContactID, wsMessage)
}

func (h *WebSocketHandler) BroadcastConversationUpdate(conversation *models.Conversation) {
	payload := conversation.ToPayload()

	message := &types.WebSocketMessage{
		Event:     types.EventTypeConversationUpdate,
		Payload:   payload,
		Timestamp: time.Now(),
	}

	h.manager.BroadcastToInboxAgents(conversation.InboxID, message)
	h.manager.BroadcastToContact(conversation.ContactID, message)
}

func (h *WebSocketHandler) BroadcastConversationGetByID(conversation *models.Conversation, client *types.WebSocketClient) {
	payload := conversation.ToPayload()
	message := &types.WebSocketMessage{
		Event:     types.EventTypeConversationGetByID,
		Payload:   payload,
		Timestamp: time.Now(),
	}

	if client.GetType() == string(types.SenderTypeContact) {
		h.manager.BroadcastToContact(conversation.ContactID, message)
	} else {
		h.manager.BroadcastToInboxAgents(conversation.InboxID, message)
	}
}

func (h *WebSocketHandler) BroadcastConversationTyping(conversation *models.Conversation) {
	message := &types.WebSocketMessage{
		Event: types.EventTypeConversationTyping,
		Payload: map[string]interface{}{
			"conversation_id": conversation.ID,
		},
		Timestamp: time.Now(),
	}
	h.manager.BroadcastToInboxAgents(conversation.InboxID, message)
}

func (h *WebSocketHandler) BroadcastConversationTypingStop(conversation *models.Conversation) {
	message := &types.WebSocketMessage{
		Event: types.EventTypeConversationTypingStop,
		Payload: map[string]interface{}{
			"conversation_id": conversation.ID,
		},
		Timestamp: time.Now(),
	}
	h.manager.BroadcastToInboxAgents(conversation.InboxID, message)
}
