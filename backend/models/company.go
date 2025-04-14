package models

import (
	"live-chat-server/utils"
	"time"

	"gorm.io/gorm"
)

type Company struct {
	ID        string         `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name      string         `gorm:"unique"`
	Email     string         `gorm:"unique"`
	Website   string         `gorm:""`
	Phone     string         `gorm:""`
	Address   string         `gorm:""`
	Logo      string         `gorm:""`
	CreatedAt time.Time      `gorm:""`
	UpdatedAt time.Time      `gorm:""`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (c *Company) ToResponse() interface{} {
	return map[string]interface{}{
		"id":         c.ID,
		"name":       c.Name,
		"email":      c.Email,
		"phone":      c.Phone,
		"website":    c.Website,
		"address":    c.Address,
		"logo":       utils.Asset(c.Logo),
		"created_at": c.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		"updated_at": c.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
