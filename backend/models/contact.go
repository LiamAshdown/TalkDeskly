package models

import (
	"live-chat-server/types"
	"time"

	"gorm.io/gorm"
)

type Contact struct {
	ID         string         `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name       *string        `gorm:"type:varchar(255)"`
	Email      *string        `gorm:"type:varchar(255)"`
	Phone      *string        `gorm:"type:varchar(50)"`
	Company    *string        `gorm:"type:varchar(255)"`
	CompanyID  string         `gorm:"type:uuid;not null"`
	CompanyRef Company        `gorm:"foreignKey:CompanyID;constraint:OnDelete:RESTRICT"`
	Notes      []ContactNote  `gorm:"foreignKey:ContactID"`
	CreatedAt  time.Time
	UpdatedAt  time.Time  
	DeletedAt  gorm.DeletedAt `gorm:"index"`
}

func (c *Contact) ToResponse() types.ContactPayload {
	name := ""
	if c.Name != nil {
		name = *c.Name
	}
	email := ""
	if c.Email != nil {
		email = *c.Email
	}
	phone := ""
	if c.Phone != nil {
		phone = *c.Phone
	}
	company := ""
	if c.Company != nil {
		company = *c.Company
	}

	return types.ContactPayload{
		ID:        c.ID,
		Name:      name,
		Email:     email,
		Phone:     phone,
		Company:   company,
		CompanyID: c.CompanyID,
		CreatedAt: c.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: c.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

func (c *Contact) ToPayload() *types.ContactPayload {
	payload := c.ToResponse()
	return &payload
}
