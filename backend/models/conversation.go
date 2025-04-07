package models

import (
	"live-chat-server/types"
	"live-chat-server/utils"
	"time"

	"gorm.io/gorm"
)

type ConversationStatus string

const (
	ConversationStatusActive   ConversationStatus = "active"
	ConversationStatusPending  ConversationStatus = "pending"
	ConversationStatusClosed   ConversationStatus = "closed"
	ConversationStatusResolved ConversationStatus = "resolved"
)

// Conversation represents a chat conversation between a contact and agents
type Conversation struct {
	ID            string             `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	InboxID       string             `gorm:"type:uuid;not null" json:"inbox_id"`
	ContactID     string             `gorm:"type:uuid;not null" json:"contact_id"`
	CompanyID     string             `gorm:"type:uuid;not null" json:"company_id"`
	AssignedToID  *string            `gorm:"type:uuid" json:"assigned_to_id"`
	Status        ConversationStatus `gorm:"type:varchar(20);not null;default:'pending'" json:"status"`
	LastMessage   string             `json:"last_message"`
	LastMessageAt *time.Time         `json:"last_message_at"`
	CreatedAt     time.Time          `json:"created_at"`
	UpdatedAt     time.Time          `json:"updated_at"`
	DeletedAt     gorm.DeletedAt     `gorm:"index" json:"-"`

	// Relationships
	Inbox      Inbox     `gorm:"foreignKey:InboxID" json:"inbox"`
	Company    Company   `gorm:"foreignKey:CompanyID" json:"company"`
	Contact    Contact   `gorm:"foreignKey:ContactID" json:"contact"`
	AssignedTo *User     `gorm:"foreignKey:AssignedToID" json:"assigned_to"`
	Messages   []Message `gorm:"foreignKey:ConversationID" json:"messages"`
}

func (c *Conversation) ToPayload() *types.ConversationPayload {
	return &types.ConversationPayload{
		ConversationID: c.ID,
		Status:         string(c.Status),
		InboxID:        c.InboxID,
		Contact: struct {
			ID    string `json:"id"`
			Name  string `json:"name"`
			Email string `json:"email"`
			Phone string `json:"phone"`
		}{
			ID:    c.ContactID,
			Name:  utils.GetStringValue(c.Contact.Name),
			Email: utils.GetStringValue(c.Contact.Email),
			Phone: utils.GetStringValue(c.Contact.Phone),
		},
		Messages: MessagesToPayload(c.Messages),
		Inbox: struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		}{
			ID:   c.InboxID,
			Name: c.Inbox.Name,
		},
	}
}
