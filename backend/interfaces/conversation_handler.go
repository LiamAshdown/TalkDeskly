package interfaces

import "live-chat-server/models"

type ConversationHandler interface {
	AssignConversation(conversation *models.Conversation, agentID string, agentName string) error
}
