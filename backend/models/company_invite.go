package models

import "time"

type CompanyInvite struct {
	ID        string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	CompanyID string    `gorm:"type:uuid"`
	UserID    string    `gorm:"type:uuid"`
	Token     string    `gorm:""`
	Email     string    `gorm:""`
	ExpiresAt time.Time `gorm:""`
	CreatedAt time.Time `gorm:""`
	UpdatedAt time.Time `gorm:""`

	Company *Company `gorm:"foreignKey:CompanyID"`
	User    *User    `gorm:"foreignKey:UserID"`
}

func (c *CompanyInvite) ToResponse() interface{} {
	return map[string]interface{}{
		"id":         c.ID,
		"token":      c.Token,
		"email":      c.Email,
		"user_id":    c.UserID,
		"user":       c.User.ToResponse(),
		"company_id": c.CompanyID,
		"company":    c.Company.ToResponse(),
		"expires_at": c.ExpiresAt,
		"created_at": c.CreatedAt,
		"updated_at": c.UpdatedAt,
	}
}
