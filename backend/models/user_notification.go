package models

import "time"

type UserNotificationType string

const (
	UserNotificationTypeAssignedConversation UserNotificationType = "assigned_conversation"
	UserNotificationTypeNewMessage           UserNotificationType = "new_message"
	UserNotificationTypeMention              UserNotificationType = "mention"
)

type UserNotification struct {
	ID        string               `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID    string               `gorm:"type:uuid;not null"`
	Type      UserNotificationType `gorm:"type:varchar(255);not null"`
	Message   string               `gorm:"type:text;not null"`
	Read      bool                 `gorm:"default:false"`
	CreatedAt time.Time            `gorm:""`
	UpdatedAt time.Time            `gorm:""`

	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}
