package models

import (
	"time"

	"gorm.io/gorm"
)

type MessageType string
type SenderType string

const (
	MessageTypeText   MessageType = "text"
	MessageTypeImage  MessageType = "image"
	MessageTypeFile   MessageType = "file"
	MessageTypeSystem MessageType = "system"
)

const (
	SenderTypeAgent   SenderType = "agent"
	SenderTypeContact SenderType = "contact"
)

// Message represents a single message in a conversation
type Message struct {
	ID             string         `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	ConversationID string         `gorm:"type:uuid;not null" json:"conversation_id"`
	SenderType     SenderType     `gorm:"type:varchar(10);not null" json:"sender_type"`
	SenderID       string         `gorm:"type:uuid;not null" json:"sender_id"`
	Type           MessageType    `gorm:"type:varchar(20);not null;default:'text'" json:"type"`
	Content        string         `gorm:"type:text;not null" json:"content"`
	Metadata       string         `gorm:"type:jsonb" json:"metadata"` // For storing additional data like file info
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Conversation  Conversation `gorm:"foreignKey:ConversationID" json:"conversation"`
	AgentSender   *User        `gorm:"foreignKey:SenderID" json:"-"` // Used when SenderType is "agent"
	ContactSender *Contact     `gorm:"foreignKey:SenderID" json:"-"` // Used when SenderType is "contact"
}

// GetSender returns either the agent or contact who sent the message
func (m *Message) GetSender() interface{} {
	if m.SenderType == SenderTypeAgent {
		return m.AgentSender
	}
	return m.ContactSender
}

// BeforeCreate GORM hook to ensure either AgentSender or ContactSender is set based on SenderType
func (m *Message) BeforeCreate(tx *gorm.DB) error {
	if m.SenderType == SenderTypeAgent {
		// Verify the sender exists in the User table
		var user User
		if err := tx.First(&user, "id = ?", m.SenderID).Error; err != nil {
			return err
		}
	} else if m.SenderType == SenderTypeContact {
		// Verify the sender exists in the Contact table
		var contact Contact
		if err := tx.First(&contact, "id = ?", m.SenderID).Error; err != nil {
			return err
		}
	}
	return nil
}
