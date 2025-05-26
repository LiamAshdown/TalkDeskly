package commands

import (
	"errors"
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/repositories"

	"github.com/gofiber/fiber/v2"
)

type HandleAssignConversationCommand struct {
	ConversationID string
	AgentID        string

	// DI dependencies
	conversationRepo    repositories.ConversationRepository
	logger              interfaces.Logger
	langContext         interfaces.LanguageContext
	userRepo            repositories.UserRepository
	c                   *fiber.Ctx
	notificationService interfaces.NotificationService
}

func (c *HandleAssignConversationCommand) Handle() (interface{}, error) {
	conversation, err := c.conversationRepo.GetConversationByID(c.ConversationID, "Inbox")
	if err != nil {
		return nil, err
	}

	user, err := c.userRepo.GetUserByID(c.AgentID)
	if err != nil {
		return nil, err
	}

	if conversation.AssignedToID != nil && *conversation.AssignedToID == c.AgentID {
		return nil, errors.New(c.langContext.T(c.c, "conversation_already_assigned"))
	}

	conversation.AssignedToID = &c.AgentID

	if conversation.Status == models.ConversationStatusPending {
		conversation.Status = models.ConversationStatusActive
	}

	conversation.AssignedTo = user

	c.notificationService.CreateNotification(user, models.UserNotificationTypeAssignedConversation, map[string]interface{}{
		"ActionURL":      c.c.BaseURL() + "/conversations/" + conversation.ID,
		"ConversationID": conversation.ID,
	})

	return conversation, c.conversationRepo.UpdateConversation(conversation)
}

func NewHandleAssignConversationCommand(
	conversationID string,
	agentID string,
	conversationRepo repositories.ConversationRepository,
	logger interfaces.Logger,
	langContext interfaces.LanguageContext,
	userRepo repositories.UserRepository,
	c *fiber.Ctx,
	notificationService interfaces.NotificationService,
) interfaces.Command {
	return &HandleAssignConversationCommand{
		ConversationID:      conversationID,
		AgentID:             agentID,
		conversationRepo:    conversationRepo,
		logger:              logger,
		langContext:         langContext,
		userRepo:            userRepo,
		c:                   c,
		notificationService: notificationService,
	}
}
