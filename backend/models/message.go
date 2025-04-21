package models

import (
	"encoding/json"
	"fmt"
	"live-chat-server/types"
	"live-chat-server/utils"
	"log"
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
	SenderTypeBot     SenderType = "bot"
	SenderTypeSystem  SenderType = "system"
)

// Message represents a single message in a conversation
type Message struct {
	ID             string         `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	ConversationID string         `gorm:"type:uuid;not null" json:"conversation_id"`
	SenderType     SenderType     `gorm:"type:varchar(10);not null" json:"sender_type"`
	SenderID       *string        `gorm:"type:uuid" json:"sender_id"`
	Type           MessageType    `gorm:"type:varchar(20);not null;default:'text'" json:"type"`
	Content        string         `gorm:"type:text;not null" json:"content"`
	Metadata       *string        `gorm:"type:jsonb" json:"metadata"` // For storing additional data like file info
	Private        bool           `gorm:"type:boolean;not null;default:false" json:"private"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Conversation  Conversation `gorm:"foreignKey:ConversationID" json:"conversation"`
	AgentSender   *User        `gorm:"-"` // Used when SenderType is "agent"
	ContactSender *Contact     `gorm:"-"` // Used when SenderType is "contact"
}

// GetSender returns either the agent or contact who sent the message
func (m *Message) GetSender() (interface{}, error) {
	if m.SenderType == SenderTypeSystem {
		return nil, nil // System messages don't have a specific sender
	} else if m.SenderType == SenderTypeAgent {
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
	if m.SenderType == SenderTypeSystem || m.SenderType == SenderTypeBot {
		// System messages don't require a sender
		return nil
	}

	if m.SenderID == nil {
		return fmt.Errorf("sender_id cannot be nil for non-system messages")
	}

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

// GetSenderAvatarUrl returns the avatar url of the sender
func (m *Message) GetSenderAvatarUrl() string {
	sender, err := m.GetSender()
	if err != nil {
		return ""
	}

	if sender == nil {
		return ""
	}

	if agent, ok := sender.(*User); ok {
		return utils.Asset(utils.GetStringValue(agent.AvatarPath))
	}

	return ""
}

// GetSenderType returns the type of the sender
func (m *Message) GetSenderType() string {
	return string(m.SenderType)
}

// ToPayload converts a Message to a payload for API responses
func (m *Message) ToPayload() types.MessagePayload {

	// Parse metadata
	var metadata map[string]interface{}
	if m.Metadata != nil {
		err := json.Unmarshal([]byte(*m.Metadata), &metadata)
		if err != nil {
			log.Printf("Error parsing metadata: %v", err)
		}
	}

	// Create the full URL to the content (which holds the path to the file)
	if m.Type == MessageTypeFile {
		m.Content = utils.Asset(m.Content)

		if metadata != nil {
			metadata["path"] = m.Content
		}
	}

	payload := types.MessagePayload{
		ConversationID: m.ConversationID,
		Content:        m.Content,
		Type:           string(m.Type),
		Metadata:       metadata,
		Private:        m.Private,
		Timestamp:      m.CreatedAt.Format("01/02/2006 15:04:05"),
	}

	// Handle system messages which don't have a sender
	if m.SenderType == SenderTypeSystem {
		payload.Name = "System"
		payload.Sender = types.Sender{
			Type: types.SenderType(m.SenderType),
			Name: "System",
		}
	} else if m.SenderType == SenderTypeBot {
		payload.Name = "Bot"
		payload.Sender = types.Sender{
			Type: types.SenderType(m.SenderType),
			Name: "Bot",
		}
	} else if m.SenderID != nil {
		payload.Name = m.GetSenderName()
		payload.Sender = types.Sender{
			ID:        *m.SenderID,
			Type:      types.SenderType(m.SenderType),
			Name:      m.GetSenderName(),
			AvatarUrl: m.GetSenderAvatarUrl(),
		}
	}

	return payload
}

// MessagesToPayload converts a slice of Messages to a slice of MessagePayload
func MessagesToPayload(messages []Message) []types.MessagePayload {
	result := make([]types.MessagePayload, len(messages))
	for i, m := range messages {
		result[i] = m.ToPayload()
	}
	return result
}
