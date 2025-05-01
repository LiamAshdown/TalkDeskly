package models

import (
	"encoding/json"
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
	Metadata      *json.RawMessage   `gorm:"type:jsonb;serializer:json" json:"metadata"`
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
		ID:             c.ID,
		ConversationID: c.ID,
		Status:         string(c.Status),
		InboxID:        c.InboxID,
		Metadata:       c.Metadata,
		AssignedTo: func() *struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		} {
			if c.AssignedTo == nil {
				return nil
			}
			return &struct {
				ID   string `json:"id"`
				Name string `json:"name"`
			}{
				ID:   utils.GetStringValue(c.AssignedToID),
				Name: c.AssignedTo.GetFullName(),
			}
		}(),
		Contact: struct {
			ID        string `json:"id"`
			Name      string `json:"name"`
			Email     string `json:"email"`
			Phone     string `json:"phone"`
			CreatedAt string `json:"created_at"`
		}{
			ID:        c.ContactID,
			Name:      utils.GetStringValue(c.Contact.Name),
			Email:     utils.GetStringValue(c.Contact.Email),
			Phone:     utils.GetStringValue(c.Contact.Phone),
			CreatedAt: c.Contact.CreatedAt.Format("01/02/2006 15:04:05"),
		},
		Messages: []types.MessagePayload{}, // Use `PayloadWithoutPrivateMessages` to get the messages
		// Reason this is not included due to heavy processing
		Inbox: struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		}{
			ID:   c.InboxID,
			Name: c.Inbox.Name,
		},
		UpdatedAt:   c.UpdatedAt.Format("01/02/2006 15:04:05"),
		CreatedAt:   c.CreatedAt.Format("01/02/2006 15:04:05"),
		LastMessage: c.LastMessage,
		LastMessageAt: func() string {
			if c.LastMessageAt == nil {
				return ""
			}
			return c.LastMessageAt.Format("01/02/2006 15:04:05")
		}(),
	}
}

func (c *Conversation) ToPayloadWithMessages() *types.ConversationPayload {
	payload := c.ToPayload()
	payload.Messages = MessagesToPayload(c.Messages)
	return payload
}

func (c *Conversation) ToPayloadWithoutMessages() *types.ConversationPayload {
	payload := c.ToPayload()
	payload.Messages = make([]types.MessagePayload, 0)
	return payload
}

func (c *Conversation) ToPayloadWithoutPrivateMessages() *types.ConversationPayload {
	payload := c.ToPayload()
	payload.Messages = MessagesToPayload(c.Messages)

	// Another pass to filter out the messages
	messages := make([]types.MessagePayload, 0)
	for _, message := range payload.Messages {
		if !message.Private {
			messages = append(messages, message)
		}
	}
	payload.Messages = messages

	return payload
}

func (c *Conversation) GetMessages() []types.MessagePayload {
	return MessagesToPayload(c.Messages)
}

func (c *Conversation) IsClosed() bool {
	return c.Status == ConversationStatusClosed
}
