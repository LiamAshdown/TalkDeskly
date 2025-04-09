package models

import (
	"live-chat-server/types"
	"time"

	"gorm.io/gorm"
)

type Contact struct {
	ID         string         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name       *string        `gorm:"type:varchar(255)" json:"name"`
	Email      *string        `gorm:"type:varchar(255)" json:"email"`
	Phone      *string        `gorm:"type:varchar(50)" json:"phone"`
	Company    *string        `gorm:"type:varchar(255)" json:"company"`
	CompanyID  string         `gorm:"type:uuid;not null" json:"company_id"`
	CompanyRef Company        `gorm:"foreignKey:CompanyID;constraint:OnDelete:RESTRICT" json:"-"`
	Notes      []ContactNote  `gorm:"foreignKey:ContactID" json:"notes,omitempty"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
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
	payload := &types.ContactPayload{
		ID:        c.ID,
		CompanyID: c.CompanyID,
		Name:      "",
		Email:     "",
		Phone:     "",
		Company:   "",
		CreatedAt: c.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: c.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	if c.Name != nil {
		payload.Name = *c.Name
	}
	if c.Email != nil {
		payload.Email = *c.Email
	}
	if c.Phone != nil {
		payload.Phone = *c.Phone
	}
	if c.Company != nil {
		payload.Company = *c.Company
	}

	return payload
}
