package models

import (
	"time"
)

type UserNotificationType string

const (
	UserNotificationTypeAssignedConversation UserNotificationType = "assigned_conversation"
	UserNotificationTypeNewMessage           UserNotificationType = "new_message"
	UserNotificationTypeMention              UserNotificationType = "mention"
)

type UserNotification struct {
	ID        string                 `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID    string                 `gorm:"type:uuid;not null"`
	Type      UserNotificationType   `gorm:"type:varchar(255);not null"`
	Message   string                 `gorm:"type:text;not null"`
	MetaData  map[string]interface{} `gorm:"type:jsonb;serializer:json"`
	Read      bool                   `gorm:"default:false"`
	CreatedAt time.Time              `gorm:""`
	UpdatedAt time.Time              `gorm:""`

	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

func (n *UserNotification) ToResponse() interface{} {
	return map[string]interface{}{
		"id":         n.ID,
		"type":       string(n.Type),
		"message":    n.Message,
		"metadata":   n.MetaData,
		"read":       n.Read,
		"created_at": n.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		"updated_at": n.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
