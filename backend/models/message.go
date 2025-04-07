package models

import (
	"fmt"
	"live-chat-server/types"
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
	Metadata       *string        `gorm:"type:jsonb" json:"metadata"` // For storing additional data like file info
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Conversation  Conversation `gorm:"foreignKey:ConversationID" json:"conversation"`
	AgentSender   *User        `gorm:"-" json:"agent_sender,omitempty"`   // Used when SenderType is "agent"
	ContactSender *Contact     `gorm:"-" json:"contact_sender,omitempty"` // Used when SenderType is "contact"
}

// GetSender returns either the agent or contact who sent the message
func (m *Message) GetSender() (interface{}, error) {
	if m.SenderType == SenderTypeAgent {
		if m.AgentSender == nil {
			return nil, fmt.Errorf("agent sender not loaded")
		}
		return m.AgentSender, nil
	} else if m.SenderType == SenderTypeContact {
		if m.ContactSender == nil {
			return nil, fmt.Errorf("contact sender not loaded")
		}
		return m.ContactSender, nil
	}
	return nil, fmt.Errorf("invalid sender type: %s", m.SenderType)
}

// LoadSender loads the appropriate sender based on SenderType
func (m *Message) LoadSender(db *gorm.DB) error {
	if m.SenderType == SenderTypeAgent {
		var user User
		if err := db.First(&user, "id = ?", m.SenderID).Error; err != nil {
			return err
		}
		m.AgentSender = &user
	} else if m.SenderType == SenderTypeContact {
		var contact Contact
		if err := db.First(&contact, "id = ?", m.SenderID).Error; err != nil {
			return err
		}
		m.ContactSender = &contact
	}
	return nil
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

// GetSenderName returns the name of the sender
func (m *Message) GetSenderName() string {
	sender, err := m.GetSender()
	if err != nil {
		return ""
	}

	if sender == nil {
		return ""
	}

	if agent, ok := sender.(*User); ok {
		return fmt.Sprintf("%s %s", agent.FirstName, agent.LastName)
	} else if contact, ok := sender.(*Contact); ok && contact.Name != nil {
		return *contact.Name
	}

	return ""
}

// GetSenderType returns the type of the sender
func (m *Message) GetSenderType() string {
	return string(m.SenderType)
}

// ToPayload converts a Message to a payload for API responses
func (m *Message) ToPayload() types.MessagePayload {
	return types.MessagePayload{
		ConversationID: m.ConversationID,
		Name:           m.GetSenderName(),
		Content:        m.Content,
		Sender: types.Sender{
			ID:   m.SenderID,
			Name: m.GetSenderName(),
		},
		Type:      string(m.Type),
		Metadata:  m.Metadata,
		Timestamp: m.CreatedAt.Format("01/02/2006 15:04:05"),
	}
}

// MessagesToPayload converts a slice of Messages to a slice of MessagePayload
func MessagesToPayload(messages []Message) []types.MessagePayload {
	result := make([]types.MessagePayload, len(messages))
	for i, m := range messages {
		result[i] = m.ToPayload()
	}
	return result
}
