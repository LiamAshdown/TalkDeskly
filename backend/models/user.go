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
	ID                   string                `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	CompanyID            *string               `json:"company_id" gorm:"type:uuid"`
	Email                string                `json:"email" gorm:"unique;not null"`
	FirstName            string                `json:"first_name" gorm:"not null"`
	LastName             string                `json:"last_name" gorm:"not null"`
	Password             string                `json:"-" gorm:"not null"`
	Role                 string                `json:"role" gorm:"not null"`
	AvatarPath           *string               `json:"avatar" gorm:"type:text"`
	CreatedAt            time.Time             `json:"created_at"`
	UpdatedAt            time.Time             `json:"updated_at"`
	Company              *Company              `json:"company" gorm:"foreignKey:CompanyID"`
	NotificationSettings *NotificationSettings `json:"notification_settings" gorm:"foreignKey:UserID"`
	DeletedAt            gorm.DeletedAt        `gorm:"index" json:"-"`
}

func (u *User) ToResponse() interface{} {
	return map[string]interface{}{
		"id":         u.ID,
		"email":      u.Email,
		"first_name": u.FirstName,
		"last_name":  u.LastName,
		"name":       fmt.Sprintf("%s %s", u.FirstName, u.LastName),
		"avatar":     utils.Asset(*u.AvatarPath),
		"role":       u.Role,
		"created_at": u.CreatedAt,
		"updated_at": u.UpdatedAt,
	}
}

func (u *User) ToProfileResponse() interface{} {
	return map[string]interface{}{
		"id":         u.ID,
		"email":      u.Email,
		"first_name": u.FirstName,
		"last_name":  u.LastName,
		"name":       fmt.Sprintf("%s %s", u.FirstName, u.LastName),
		"avatar":     utils.Asset(utils.GetStringValue(u.AvatarPath)),
		"role":       u.Role,
		"created_at": u.CreatedAt,
		"updated_at": u.UpdatedAt,
		"notification_settings": u.NotificationSettings,
	}
}