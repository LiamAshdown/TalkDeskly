package commands

import (
	"live-chat-server/interfaces"
	"live-chat-server/listeners"
	"live-chat-server/models"
	"live-chat-server/repositories"
	"live-chat-server/types"
	"math/rand"
)

// HandleInboxFeaturesCommand represents the command to handle inbox-specific features
type HandleInboxFeaturesCommand struct {
	Conversation *models.Conversation
	Inbox        *models.Inbox

	// DI dependencies
	conversationHandler interfaces.ConversationHandler
	logger              interfaces.Logger
	inboxRepo           repositories.InboxRepository
	conversationRepo    repositories.ConversationRepository
	dispatcher          interfaces.Dispatcher
}

// Handle implements the Command interface
func (c *HandleInboxFeaturesCommand) Handle() (interface{}, error) {
	// Handle auto-responder if enabled
	if c.Inbox.AutoResponderMessage != "" && c.Inbox.AutoResponderEnabled {
		c.SendBotMessage(c.Inbox.AutoResponderMessage)
	}

	// Handle auto-assignment if enabled
	if c.Inbox.AutoAssignmentEnabled {
		c.assignConversationToAgent(c.Inbox.MaxAutoAssignments)
	}

	return nil, nil
}

// SendBotMessage sends a bot message to the conversation
func (c *HandleInboxFeaturesCommand) SendBotMessage(content string) (interface{}, error) {
	internalMessage := &listeners.InternalMessagePayload{
		ConversationID: c.Conversation.ID,
		Content:        content,
		Type:           "text",
	}
	internalMessage.Sender.ID = ""
	internalMessage.Sender.Type = types.SenderTypeBot

	messagePayload := map[string]interface{}{
		"message":      internalMessage,
		"conversation": c.Conversation,
	}

	c.dispatcher.Dispatch(interfaces.EventTypeConversationSendMessage, messagePayload)

	return nil, nil
}

// assignConversationToAgent assigns the conversation to an available agent
func (c *HandleInboxFeaturesCommand) assignConversationToAgent(maxAutoAssignments int) {
	agents, err := c.inboxRepo.GetUsersForInbox(c.Conversation.InboxID)
	if err != nil {
		c.logger.Error("Failed to get agents", "error", err)
		return
	}

	availableAgents := []models.User{}
	for _, agent := range agents {
		conversations, err := c.conversationRepo.GetActiveAssignedConversationsForUser(agent.ID)
		if err != nil {
			c.logger.Error("Failed to get conversations", "error", err)
			continue
		}

		if len(conversations) >= maxAutoAssignments {
			continue
		}

		availableAgents = append(availableAgents, agent)
	}

	if len(availableAgents) > 0 {
		randomAgent := availableAgents[rand.Intn(len(availableAgents))]
		err := c.conversationHandler.AssignConversation(c.Conversation, randomAgent.ID, randomAgent.GetFullName())
		if err != nil {
			c.logger.Error("Failed to assign conversation", "error", err)
		}
	}
}

// NewHandleInboxFeaturesCommand creates a new HandleInboxFeaturesCommand
func NewHandleInboxFeaturesCommand(
	conversation *models.Conversation,
	inbox *models.Inbox,
	conversationHandler interfaces.ConversationHandler,
	logger interfaces.Logger,
	inboxRepo repositories.InboxRepository,
	conversationRepo repositories.ConversationRepository,
	dispatcher interfaces.Dispatcher,
) interfaces.Command {
	return &HandleInboxFeaturesCommand{
		Conversation:        conversation,
		Inbox:               inbox,
		conversationHandler: conversationHandler,
		logger:              logger,
		inboxRepo:           inboxRepo,
		conversationRepo:    conversationRepo,
		dispatcher:          dispatcher,
	}
}
