package models

import "time"

type CannedResponse struct {
	ID        string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Title     string    `gorm:""`
	Message   string    `gorm:""`
	Tag       string    `gorm:""`
	CompanyID string    `gorm:"type:uuid"`
	UserID    string    `gorm:"type:uuid"`
	CreatedAt time.Time `gorm:""`
	UpdatedAt time.Time `gorm:""`

	Company *Company `gorm:"foreignKey:CompanyID"`
	User    *User    `gorm:"foreignKey:UserID"`
}

func (c *CannedResponse) ToResponse() interface{} {
	return map[string]interface{}{
		"id":         c.ID,
		"title":      c.Title,
		"message":    c.Message,
		"tag":        c.Tag,
		"created_at": c.CreatedAt,
		"updated_at": c.UpdatedAt,
	}
}
