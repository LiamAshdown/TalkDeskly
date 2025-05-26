package interfaces

import (
	"live-chat-server/models"
	"live-chat-server/types"

	"github.com/gofiber/fiber/v2"
)

// CommandFactory creates commands
type CommandFactory interface {
	// NewStartConversationCommand creates a new StartConversationCommand
	NewStartConversationCommand(client *types.WebSocketClient, payload *types.IncomingStartConversationPayload) Command

	// NewHandlePreChatFormCommand creates a new HandlePreChatFormCommand
	NewHandlePreChatFormCommand(client *types.WebSocketClient, conversation *models.Conversation, formData map[string]interface{}) Command

	// NewHandleInboxFeaturesCommand creates a new HandleInboxFeaturesCommand
	NewHandleInboxFeaturesCommand(conversation *models.Conversation, inbox *models.Inbox) Command

	// NewHandleAssignConversationCommand creates a new HandleAssignConversationCommand
	NewHandleAssignConversationCommand(conversationID string, agentID string, c *fiber.Ctx) Command
}
