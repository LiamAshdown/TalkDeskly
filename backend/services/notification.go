package services

import (
	"live-chat-server/config"
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/types"

	"gorm.io/gorm"
)

type NotificationService struct {
	db           *gorm.DB
	logger       interfaces.Logger
	jobClient    interfaces.JobClient
	pubSub       interfaces.PubSub
	emailService interfaces.EmailService
	langContext  interfaces.LanguageContext
	config       config.ConfigManager
}

func NewNotificationService(db *gorm.DB, logger interfaces.Logger, jobClient interfaces.JobClient, pubSub interfaces.PubSub, emailService interfaces.EmailService, langContext interfaces.LanguageContext, config config.ConfigManager) interfaces.NotificationService {
	return &NotificationService{db: db, logger: logger, jobClient: jobClient, pubSub: pubSub, emailService: emailService, langContext: langContext, config: config}
}

func (s *NotificationService) CreateNotification(user *models.User, notificationType models.UserNotificationType, data map[string]interface{}) error {
	notificationSettings := user.GetNotificationSettings()
	message := ""
	subject := ""

	switch notificationType {
	case models.UserNotificationTypeNewMessage:
		if !notificationSettings.NewMessage {
			return nil
		}
		message = "notification_content_new_message"
		subject = "notification_subject_new_message"
	case models.UserNotificationTypeAssignedConversation:
		if !notificationSettings.NewConversation {
			return nil
		}
		message = "notification_content_new_conversation"
		subject = "notification_subject_new_conversation"
	case models.UserNotificationTypeMention:
		if !notificationSettings.Mentions {
			return nil
		}
		message = "notification_content_mention"
		subject = "notification_subject_mention"
	}

	if notificationSettings.EmailEnabled {
		templateData := map[string]interface{}{
			"UserName":       user.GetFullName(),
			"MessageContent": s.langContext.T(nil, message),
		}

		// Flatten the data map into the template data
		for key, value := range data {
			templateData[key] = value
		}

		s.emailService.SendTemplatedEmailAsync(user.Email, s.langContext.T(nil, subject), "notifications.html", templateData)
	}

	// Create the notification
	notification := &models.UserNotification{
		UserID:   user.ID,
		Type:     notificationType,
		Message:  message,
		MetaData: data,
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
