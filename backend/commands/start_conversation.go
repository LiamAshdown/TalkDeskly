package commands

import (
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/repositories"
	"live-chat-server/types"
)

// StartConversationCommand represents the command to start a new conversation
type StartConversationCommand struct {
	Client       *types.WebSocketClient
	Payload      *types.IncomingStartConversationPayload
	Conversation *models.Conversation
	Inbox        *models.Inbox

	// DI dependencies
	conversationRepo repositories.ConversationRepository
	inboxRepo        repositories.InboxRepository
	logger           interfaces.Logger
}

// Handle implements the Command interface
func (c *StartConversationCommand) Handle() (interface{}, error) {
	// Create initial conversation
	conversation := &models.Conversation{
		InboxID:   c.Payload.InboxID,
		ContactID: c.Client.GetID(),
		CompanyID: c.Client.GetCompanyID(),
		Status:    models.ConversationStatusPending,
	}

	// Create conversation in database
	if err := c.conversationRepo.CreateConversation(conversation); err != nil {
		return nil, err
	}

	// Get conversation with all relations
	conversationPtr, err := c.conversationRepo.GetConversationByID(conversation.ID, "Messages", "Inbox", "Contact", "AssignedTo")
	if err != nil {
		return nil, err
	}

	// Get inbox details
	inbox, err := c.inboxRepo.GetInboxByID(conversationPtr.InboxID)
	if err != nil {
		return nil, err
	}

	c.Conversation = conversationPtr
	c.Inbox = inbox

	return inbox, nil
}

// NewStartConversationCommand creates a new StartConversationCommand
func NewStartConversationCommand(
	client *types.WebSocketClient,
	payload *types.IncomingStartConversationPayload,
	conversationRepo repositories.ConversationRepository,
	inboxRepo repositories.InboxRepository,
	logger interfaces.Logger,
) interfaces.Command {
	return &StartConversationCommand{
		Client:           client,
		Payload:          payload,
		conversationRepo: conversationRepo,
		inboxRepo:        inboxRepo,
		logger:           logger,
	}
}
