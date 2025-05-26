package factory

import (
	"live-chat-server/commands"
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/types"

	"github.com/gofiber/fiber/v2"
)

// CommandFactoryImpl implements CommandFactory
type CommandFactoryImpl struct {
	container interfaces.Container
}

// NewCommandFactory creates a new CommandFactory
func NewCommandFactory(container interfaces.Container) interfaces.CommandFactory {
	return &CommandFactoryImpl{
		container: container,
	}
}

func (f *CommandFactoryImpl) NewStartConversationCommand(client *types.WebSocketClient, payload *types.IncomingStartConversationPayload) interfaces.Command {
	return commands.NewStartConversationCommand(
		client,
		payload,
		f.container.GetConversationRepo(),
		f.container.GetInboxRepo(),
		f.container.GetLogger(),
	)
}

func (f *CommandFactoryImpl) NewHandlePreChatFormCommand(client *types.WebSocketClient, conversation *models.Conversation, formData map[string]interface{}) interfaces.Command {
	return commands.NewHandlePreChatFormCommand(
		client,
		conversation,
		formData,
		f.container.GetConversationRepo(),
		f.container.GetContactRepo(),
		f.container.GetInboxRepo(),
		f.container.GetLogger(),
		f.container.GetDispatcher(),
	)
}

func (f *CommandFactoryImpl) NewHandleInboxFeaturesCommand(conversation *models.Conversation, inbox *models.Inbox) interfaces.Command {
	return commands.NewHandleInboxFeaturesCommand(
		conversation,
		inbox,
		f.container.GetConversationHandler(),
		f.container.GetLogger(),
		f.container.GetInboxRepo(),
		f.container.GetConversationRepo(),
		f.container.GetDispatcher(),
	)
}

func (f *CommandFactoryImpl) NewHandleAssignConversationCommand(conversationID string, agentID string, c *fiber.Ctx) interfaces.Command {
	return commands.NewHandleAssignConversationCommand(
		conversationID,
		agentID,
		f.container.GetConversationRepo(),
		f.container.GetLogger(),
		f.container.GetLanguageContext(),
		f.container.GetUserRepo(),
		c,
		f.container.GetNotificationService(),
	)
}
