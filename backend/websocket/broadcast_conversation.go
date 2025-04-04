package websocket

import (
	"live-chat-server/models"
	"live-chat-server/types"
	"live-chat-server/utils"
)

// BroadcastConversationCreated broadcasts a conversation creation event to all agents in the inbox
func BroadcastConversationStart(conversation *models.Conversation) {
	payload := types.OutgoingCreateConversationPayload{
		ConversationID: conversation.ID,
		Status:         string(conversation.Status),
		InboxID:        conversation.InboxID,
		Contact: struct {
			ID    string `json:"id"`
			Name  string `json:"name"`
			Email string `json:"email"`
			Phone string `json:"phone"`
		}{
			ID:    conversation.ContactID,
			Name:  utils.GetStringValue(conversation.Contact.Name),
			Email: utils.GetStringValue(conversation.Contact.Email),
			Phone: utils.GetStringValue(conversation.Contact.Phone),
		},
		Inbox: struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		}{
			ID:   conversation.InboxID,
			Name: conversation.Inbox.Name,
		},
	}

	if conversation.Contact.Email != nil {
		payload.Contact.Email = *conversation.Contact.Email
	}

	if conversation.Contact.Phone != nil {
		payload.Contact.Phone = *conversation.Contact.Phone
	}

	BroadcastToInboxAgents(conversation.InboxID, types.EventTypeConversationStart, payload)
}

func BroadcastConversationSendMessage(conversation *models.Conversation) {
	message := conversation.Messages[len(conversation.Messages)-1]

	payload := types.OutgoingSendMessagePayload{
		ConversationID: conversation.ID,
		Content:        message.Content,
		SenderID:       message.SenderID,
		SenderType:     string(message.SenderType),
		Type:           string(message.Type),
		Metadata:       message.Metadata,
	}

	BroadcastToInboxAgents(conversation.InboxID, types.EventTypeConversationSendMessage, payload)
	BroadcastToContact(conversation.ContactID, types.EventTypeConversationSendMessage, payload)
}
