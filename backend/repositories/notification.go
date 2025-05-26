package repositories

import (
	"live-chat-server/models"

	"gorm.io/gorm"
)

type NotificationRepository interface {
	GetNotificationsByUserID(userID string, limit, offset int, unreadOnly bool) ([]models.UserNotification, error)
	GetNotificationByID(notificationID, userID string) (*models.UserNotification, error)
	GetNotificationCount(userID string, unreadOnly bool) (int64, error)
	GetUnreadCount(userID string) (int64, error)
	MarkAsRead(notificationIDs []string, userID string) (int64, error)
	MarkAllAsRead(userID string) (int64, error)
	DeleteNotification(notificationID, userID string) (int64, error)
	DeleteAllNotifications(userID string) (int64, error)
	CreateNotification(notification *models.UserNotification) error
}

type notificationRepository struct {
	db *gorm.DB
}

func NewNotificationRepository(db *gorm.DB) NotificationRepository {
	return &notificationRepository{db: db}
}

func (r *notificationRepository) GetNotificationsByUserID(userID string, limit, offset int, unreadOnly bool) ([]models.UserNotification, error) {
	var notifications []models.UserNotification

	query := r.db.Where("user_id = ?", userID)
	if unreadOnly {
		query = query.Where("read = ?", false)
	}

	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&notifications).Error; err != nil {
		return nil, err
	}

	return notifications, nil
}

func (r *notificationRepository) GetNotificationByID(notificationID, userID string) (*models.UserNotification, error) {
	var notification models.UserNotification
	if err := r.db.Where("id = ? AND user_id = ?", notificationID, userID).First(&notification).Error; err != nil {
		return nil, err
	}

	return &notification, nil
}

func (r *notificationRepository) GetNotificationCount(userID string, unreadOnly bool) (int64, error) {
	var count int64

	query := r.db.Model(&models.UserNotification{}).Where("user_id = ?", userID)
	if unreadOnly {
		query = query.Where("read = ?", false)
	}

	if err := query.Count(&count).Error; err != nil {
		return 0, err
	}

	return count, nil
}

func (r *notificationRepository) GetUnreadCount(userID string) (int64, error) {
	return r.GetNotificationCount(userID, true)
}

func (r *notificationRepository) MarkAsRead(notificationIDs []string, userID string) (int64, error) {
	result := r.db.Model(&models.UserNotification{}).
		Where("id IN ? AND user_id = ?", notificationIDs, userID).
		Update("read", true)

	return result.RowsAffected, result.Error
}

func (r *notificationRepository) MarkAllAsRead(userID string) (int64, error) {
	result := r.db.Model(&models.UserNotification{}).
		Where("user_id = ? AND read = ?", userID, false).
		Update("read", true)

	return result.RowsAffected, result.Error
}

func (r *notificationRepository) DeleteNotification(notificationID, userID string) (int64, error) {
	result := r.db.Where("id = ? AND user_id = ?", notificationID, userID).Delete(&models.UserNotification{})

	return result.RowsAffected, result.Error
}

func (r *notificationRepository) DeleteAllNotifications(userID string) (int64, error) {
	result := r.db.Where("user_id = ?", userID).Delete(&models.UserNotification{})

	return result.RowsAffected, result.Error
}

func (r *notificationRepository) CreateNotification(notification *models.UserNotification) error {
	return r.db.Create(notification).Error
}
