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
	AvatarPath           *string               `gorm:"type:text"`
	CreatedAt            time.Time             `gorm:""`
	UpdatedAt            time.Time             `gorm:""`
	Company              *Company              `gorm:"foreignKey:CompanyID"`
	NotificationSettings *NotificationSettings `gorm:"foreignKey:UserID"`
	DeletedAt            gorm.DeletedAt        `gorm:"index" json:"-"`
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
	return map[string]interface{}{
		"id":         u.ID,
		"email":      u.Email,
		"first_name": u.FirstName,
		"last_name":  u.LastName,
		"name":       u.GetFullName(),
		"avatar":     u.GetAvatar(),
		"role":       u.Role,
		"company_id": u.CompanyID,
		"company":    u.Company,
		"created_at": u.CreatedAt,
		"updated_at": u.UpdatedAt,
	}
}

func (u *User) ToProfileResponse() interface{} {
	return map[string]interface{}{
		"id":                    u.ID,
		"email":                 u.Email,
		"first_name":            u.FirstName,
		"last_name":             u.LastName,
		"name":                  u.GetFullName(),
		"avatar":                u.GetAvatar(),
		"role":                  u.Role,
		"created_at":            u.CreatedAt,
		"updated_at":            u.UpdatedAt,
		"notification_settings": u.NotificationSettings,
	}
}
