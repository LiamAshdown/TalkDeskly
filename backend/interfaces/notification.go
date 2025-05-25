package interfaces

import "live-chat-server/models"

type NotificationService interface {
	CreateNotification(user *models.User, notificationType models.UserNotificationType) error
}
