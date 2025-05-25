package models

import (
	"fmt"
	"live-chat-server/utils"
	"time"

	"gorm.io/gorm"
)

type UserRole string

const (
	RoleAdmin  UserRole = "admin"
	RoleAgent  UserRole = "agent"
	RoleClient UserRole = "client"
)

type User struct {
	ID                   string                `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	CompanyID            *string               `gorm:"type:uuid"`
	Email                string                `gorm:"unique;not null"`
	FirstName            string                `gorm:"not null"`
	LastName             string                `gorm:"not null"`
	Password             string                `gorm:"not null"`
	Role                 string                `gorm:"not null"`
	Language             string                `gorm:"type:varchar(10);default:'en'"`
	AvatarPath           *string               `gorm:"type:text"`
	CreatedAt            time.Time             `gorm:""`
	UpdatedAt            time.Time             `gorm:""`
	Company              *Company              `gorm:"foreignKey:CompanyID"`
	NotificationSettings *NotificationSettings `gorm:"foreignKey:UserID"`
	DeletedAt            gorm.DeletedAt        `gorm:"index" json:"-"`
	Inboxes              []*Inbox              `gorm:"many2many:inbox_users;"`
}

func (u *User) GetFullName() string {
	return fmt.Sprintf("%s %s", u.FirstName, u.LastName)
}

func (u *User) GetAvatar() string {
	if u.AvatarPath == nil {
		return ""
	}

	return utils.Asset(utils.GetStringValue(u.AvatarPath))
}

func (u *User) ToResponse() interface{} {
	var company interface{}

	if u.Company != nil {
		company = u.Company.ToResponse()
	}

	return map[string]interface{}{
		"id":         u.ID,
		"email":      u.Email,
		"first_name": u.FirstName,
		"last_name":  u.LastName,
		"name":       u.GetFullName(),
		"avatar":     u.GetAvatar(),
		"role":       u.Role,
		"language":   u.Language,
		"company_id": u.CompanyID,
		"company":    company,
		"created_at": u.CreatedAt,
		"updated_at": u.UpdatedAt,
	}
}

func (u *User) ToProfileResponse() interface{} {
	if u.NotificationSettings == nil {
		u.NotificationSettings = &NotificationSettings{
			NewConversation: true,
			NewMessage:      true,
			Mentions:        true,
			EmailEnabled:    true,
			BrowserEnabled:  false,
		}
	}

	return map[string]interface{}{
		"id":                    u.ID,
		"email":                 u.Email,
		"first_name":            u.FirstName,
		"last_name":             u.LastName,
		"name":                  u.GetFullName(),
		"avatar":                u.GetAvatar(),
		"role":                  u.Role,
		"language":              u.Language,
		"created_at":            u.CreatedAt,
		"updated_at":            u.UpdatedAt,
		"notification_settings": u.NotificationSettings,
	}
}

func (u *User) GetNotificationSettings() *NotificationSettings {
	if u.NotificationSettings == nil {
		u.NotificationSettings = &NotificationSettings{
			NewConversation: true,
			NewMessage:      true,
			Mentions:        true,
			EmailEnabled:    true,
		}
	}

	return u.NotificationSettings
}
