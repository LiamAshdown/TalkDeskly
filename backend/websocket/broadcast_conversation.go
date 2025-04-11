package websocket

import (
	"live-chat-server/models"
	"live-chat-server/types"
)

// BroadcastConversationCreated broadcasts a conversation creation event to all agents in the inbox
func BroadcastConversationStart(conversation *models.Conversation) {
	payload := conversation.ToPayload()

	BroadcastToInboxAgents(conversation.InboxID, types.EventTypeConversationStart, payload)
	BroadcastToContact(conversation.ContactID, types.EventTypeConversationStart, payload)
}

func BroadcastConversationSendMessage(conversation *models.Conversation) {
	message := conversation.Messages[len(conversation.Messages)-1]

	payload := types.OutgoingSendMessagePayload{
		ID:             message.ID,
		ConversationID: conversation.ID,
		Name:           message.GetSenderName(),
		Content:        message.Content,
		Sender: types.Sender{
			ID:        message.SenderID,
			Name:      message.GetSenderName(),
			Type:      types.SenderType(message.GetSenderType()),
			AvatarUrl: message.GetSenderAvatarUrl(),
		},
		Type:      string(message.Type),
		Metadata:  message.Metadata,
		Timestamp: message.CreatedAt.Format("01/02/2006 15:04:05"),
	}

	BroadcastToInboxAgents(conversation.InboxID, types.EventTypeConversationSendMessage, payload)
	BroadcastToContact(conversation.ContactID, types.EventTypeConversationSendMessage, payload)
}

func BroadcastConversationUpdate(conversation *models.Conversation) {
	payload := conversation.ToPayload()

	BroadcastToInboxAgents(conversation.InboxID, types.EventTypeConversationUpdate, payload)
	BroadcastToContact(conversation.ContactID, types.EventTypeConversationUpdate, payload)
}

func BroadcastConversationGetByID(conversation *models.Conversation, client *types.WebSocketClient) {
	payload := conversation.ToPayload()
	if client.GetType() == string(types.SenderTypeContact) {
		BroadcastToContact(conversation.ContactID, types.EventTypeConversationGetByID, payload)
	} else {
		BroadcastToInboxAgents(conversation.InboxID, types.EventTypeConversationGetByID, payload)
	}
}

func BroadcastConversationTyping(conversation *models.Conversation) {
	BroadcastToInboxAgents(conversation.InboxID, types.EventTypeConversationTyping, map[string]interface{}{
		"conversation_id": conversation.ID,
	})
}

func BroadcastConversationTypingStop(conversation *models.Conversation) {
	BroadcastToInboxAgents(conversation.InboxID, types.EventTypeConversationTypingStop, map[string]interface{}{
		"conversation_id": conversation.ID,
	})
}
