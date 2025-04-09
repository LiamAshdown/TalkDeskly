package models

import (
	"fmt"
	"live-chat-server/types"
	"time"

	"gorm.io/gorm"
)

type ContactNote struct {
	ID        string         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Content   string         `gorm:"type:text;not null" json:"content"`
	ContactID string         `gorm:"type:uuid;not null" json:"contact_id"`
	Contact   Contact        `gorm:"foreignKey:ContactID;constraint:OnDelete:CASCADE" json:"-"`
	UserID    string         `gorm:"type:uuid;not null" json:"user_id"`
	User      User           `gorm:"foreignKey:UserID;constraint:OnDelete:RESTRICT" json:"-"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (cn *ContactNote) ToResponse() types.ContactNotePayload {
	return types.ContactNotePayload{
		ID:        cn.ID,
		Content:   cn.Content,
		ContactID: cn.ContactID,
		UserID:    cn.UserID,
		User: struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		}{
			ID:   cn.User.ID,
			Name: fmt.Sprintf("%s %s", cn.User.FirstName, cn.User.LastName),
		},
		CreatedAt: cn.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: cn.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

func (cn *ContactNote) ToPayload() types.ContactNotePayload {
	return cn.ToResponse()
}
