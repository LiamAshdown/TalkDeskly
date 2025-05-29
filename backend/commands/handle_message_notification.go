package commands

import (
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/repositories"
	"regexp"
	"strings"
)

type HandleMessageNotificationCommand struct {
	conversation        *models.Conversation
	message             *models.Message
	conversationRepo    repositories.ConversationRepository
	userRepo            repositories.UserRepository
	notificationService interfaces.NotificationService
	pubSub              interfaces.PubSub
	logger              interfaces.Logger
}

func (c *HandleMessageNotificationCommand) Handle() (interface{}, error) {
	if c.message.SenderType == models.SenderTypeContact {
		if c.conversation.AssignedToID != nil {
			// We can use the pubsub service to identify if the user (agent) is online
			// and is listening to their channel
			if len(c.pubSub.GetSubscribers("user:"+*c.conversation.AssignedToID)) == 0 {
				user, err := c.userRepo.GetUserByID(*c.conversation.AssignedToID)
				if err != nil {
					c.logger.Error("Error getting user by ID:", err)
					return nil, err
				}

				if user.NotificationSettings.NewMessage {

					c.notificationService.CreateNotification(
						user,
						models.UserNotificationTypeNewMessage,
						map[string]interface{}{
							"conversation_id": c.conversation.ID,
						},
					)
				}
			}
		}
	}

	// It's a private message.
	// Let's check if the message contains a mention
	if c.message.Private && strings.Contains(c.message.Content, "@") {
		users, err := c.userRepo.GetUsersByCompanyID(c.conversation.CompanyID)
		usersKeyedByName := make(map[string]models.User)

		for _, user := range users {
			usersKeyedByName[user.GetFullName()] = user
		}

		if err == nil {
			// TODO This can be moved into a function
			regex := regexp.MustCompile(`@([A-Za-z]+ [A-Za-z]+)`)
			matches := regex.FindStringSubmatch(c.message.Content)
			if len(matches) > 1 {
				for _, match := range matches {
					if user, ok := usersKeyedByName[match]; ok {
						c.logger.Info("Mentioned user", "user", user.GetFullName())

						if user.NotificationSettings.Mentions {

							c.notificationService.CreateNotification(
								&user,
								models.UserNotificationTypeMention,
								map[string]interface{}{
									"conversation_id": c.conversation.ID,
								},
							)
						}
					}
				}
			}
		} else {
			c.logger.Error("Error getting users by company ID:", err)
		}
	}

	return nil, nil
}

func NewHandleMessageNotificationCommand(
	conversation *models.Conversation,
	message *models.Message,
	conversationRepo repositories.ConversationRepository,
	userRepo repositories.UserRepository,
	notificationService interfaces.NotificationService,
	pubSub interfaces.PubSub,
	logger interfaces.Logger,
) interfaces.Command {
	return &HandleMessageNotificationCommand{
		conversation:        conversation,
		conversationRepo:    conversationRepo,
		userRepo:            userRepo,
		notificationService: notificationService,
		message:             message,
		pubSub:              pubSub,
		logger:              logger,
	}
}
