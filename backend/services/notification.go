package services

import (
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/types"

	"gorm.io/gorm"
)

type NotificationService struct {
	db            *gorm.DB
	logger        interfaces.Logger
	jobClient     interfaces.JobClient
	pubSub        interfaces.PubSub
	emailProvider interfaces.EmailProvider
}

func NewNotificationService(db *gorm.DB, logger interfaces.Logger, jobClient interfaces.JobClient, pubSub interfaces.PubSub, emailProvider interfaces.EmailProvider) *NotificationService {
	return &NotificationService{db: db, logger: logger, jobClient: jobClient, pubSub: pubSub, emailProvider: emailProvider}
}

func (s *NotificationService) CreateNotification(user *models.User, notificationType models.UserNotificationType) error {
	notificationSettings := user.GetNotificationSettings()
	message := ""

	switch notificationType {
	case models.UserNotificationTypeNewMessage:
		if !notificationSettings.NewMessage {
			return nil
		}
		message = "You have a new message"
	case models.UserNotificationTypeAssignedConversation:
		if !notificationSettings.NewConversation {
			return nil
		}
		message = "You have been assigned a new conversation"
	case models.UserNotificationTypeMention:
		if !notificationSettings.Mentions {
			return nil
		}
		message = "You have been mentioned in a message"
	}

	if notificationSettings.EmailEnabled {
		s.emailProvider.SendTemplatedEmailAsJob(user.Email, "TalkDeskly - New Notification", "notifications.html", map[string]interface{}{
			"UserName":       user.GetFullName(),
			"MessageContent": message,
		})
	}

	// Create the notification
	notification := &models.UserNotification{
		UserID:  user.ID,
		Type:    notificationType,
		Message: message,
	}

	// Save the notification
	if err := s.db.Create(notification).Error; err != nil {
		return err
	}

	s.pubSub.Publish("agent:"+user.ID, types.EventTypeUserNotificationCreated, &types.OutgoingUserNotificationPayload{
		NotificationID: notification.ID,
		Message:        notification.Message,
		Read:           false,
		Type:           string(notification.Type),
	})

	return nil
}
