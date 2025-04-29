package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"live-chat-server/types"
	"time"

	"gorm.io/gorm"
)

type InboxType string

const (
	InboxTypeWebChat  InboxType = "web_chat"
	InboxTypeEmail    InboxType = "email"
	InboxTypeSMS      InboxType = "sms"
	InboxTypeWhatsApp InboxType = "whatsapp"
)

// Inbox represents a communication channel with common fields
type Inbox struct {
	ID                    string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	CompanyID             string    `gorm:"type:uuid"`
	Name                  string    `gorm:"not null"`
	Type                  InboxType `gorm:"not null"`
	Description           string
	Enabled               bool `gorm:"default:true"`
	AutoAssignmentEnabled bool `gorm:"default:false"`
	MaxAutoAssignments    int  `gorm:"default:1"`
	AutoResponderEnabled  bool `gorm:"default:false"`
	AutoResponderMessage  string
	Users                 []User `gorm:"many2many:inbox_users;"`
	CreatedAt             time.Time
	UpdatedAt             time.Time
	DeletedAt             gorm.DeletedAt `gorm:"index" json:"-"`
	Company               Company        `gorm:"foreignKey:CompanyID"`

	// Type-specific configurations (relationships)
	WebChat *InboxWebChat `gorm:"foreignKey:InboxID"`
	Email   *InboxEmail   `gorm:"foreignKey:InboxID"`
}

// InboxWebChat contains web chat specific configurations
type InboxWebChat struct {
	ID                  string `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	InboxID             string `gorm:"type:uuid;uniqueIndex"`
	WelcomeMessage      string
	WorkingHours        types.WorkingHoursMap `gorm:"type:jsonb"`
	OutsideHoursMessage string
	WidgetCustomization types.WidgetCustomization `gorm:"type:jsonb"`
	PreChatForm         types.PreChatForm         `gorm:"type:jsonb"`
	CreatedAt           time.Time
	UpdatedAt           time.Time
}

// Scan implements the sql.Scanner interface to properly handle JSON in PreChatForm
func (w *InboxWebChat) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}

	return json.Unmarshal(bytes, &w)
}

// Value implements the driver.Valuer interface for proper serialization
func (w InboxWebChat) Value() (driver.Value, error) {
	return json.Marshal(w)
}

// InboxEmail contains email specific configurations
type InboxEmail struct {
	ID         string `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	InboxID    string `gorm:"type:uuid;uniqueIndex"`
	ImapServer string
	ImapPort   int
	SmtpServer string
	SmtpPort   int
	Username   string
	Password   string
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

func (inbox *Inbox) ToResponse() types.InboxPayload {
	users := make([]types.UserInboxPayload, len(inbox.Users))
	for i, user := range inbox.Users {
		users[i] = types.UserInboxPayload{
			ID:   user.ID,
			Name: user.FirstName + " " + user.LastName,
		}
	}

	// Create the payload with common fields
	payload := types.InboxPayload{
		ID:                    inbox.ID,
		Name:                  inbox.Name,
		Type:                  string(inbox.Type),
		Description:           inbox.Description,
		CompanyID:             inbox.CompanyID,
		Enabled:               inbox.Enabled,
		AutoAssignmentEnabled: inbox.AutoAssignmentEnabled,
		MaxAutoAssignments:    inbox.MaxAutoAssignments,
		AutoResponderEnabled:  inbox.AutoResponderEnabled,
		AutoResponderMessage:  inbox.AutoResponderMessage,
		UserCount:             len(inbox.Users),
		CreatedAt:             inbox.CreatedAt.Format("02-01-2006 15:04:05"),
		UpdatedAt:             inbox.UpdatedAt.Format("02-01-2006 15:04:05"),
		Users:                 users,
	}

	// Add type-specific fields based on inbox type
	switch inbox.Type {
	case InboxTypeWebChat:
		if inbox.WebChat != nil {
			payload.WelcomeMessage = inbox.WebChat.WelcomeMessage
			payload.OutsideHoursMessage = inbox.WebChat.OutsideHoursMessage
			payload.WidgetCustomization = inbox.WebChat.WidgetCustomization
			payload.PreChatForm = &inbox.WebChat.PreChatForm

			// Handle working hours
			workingHours := inbox.WebChat.WorkingHours
			if workingHours == nil {
				workingHours = types.WorkingHoursMap{
					"monday":    types.WorkingHours{StartTime: "09:00", EndTime: "17:00", Enabled: true},
					"tuesday":   types.WorkingHours{StartTime: "09:00", EndTime: "17:00", Enabled: true},
					"wednesday": types.WorkingHours{StartTime: "09:00", EndTime: "17:00", Enabled: true},
					"thursday":  types.WorkingHours{StartTime: "09:00", EndTime: "17:00", Enabled: true},
					"friday":    types.WorkingHours{StartTime: "09:00", EndTime: "17:00", Enabled: true},
					"saturday":  types.WorkingHours{StartTime: "09:00", EndTime: "17:00", Enabled: false},
					"sunday":    types.WorkingHours{StartTime: "09:00", EndTime: "17:00", Enabled: false},
				}
			}

			payload.WorkingHours = workingHours

			// Determine if working hours are enabled
			workingHoursEnabled := false
			for _, wh := range workingHours {
				if wh.Enabled {
					workingHoursEnabled = true
					break
				}
			}
			payload.WorkingHoursEnabled = workingHoursEnabled
		}
	case InboxTypeEmail:
		if inbox.Email != nil {
			payload.ImapServer = inbox.Email.ImapServer
			payload.ImapPort = inbox.Email.ImapPort
			payload.SmtpServer = inbox.Email.SmtpServer
			payload.SmtpPort = inbox.Email.SmtpPort
			payload.Username = inbox.Email.Username
		}
	}

	return payload
}

func (inbox *Inbox) ToPayload() types.InboxPayload {
	return inbox.ToResponse()
}

func (inbox *Inbox) ToPublicPayload() types.InboxPayload {
	// Similar to ToResponse but with fewer fields
	payload := types.InboxPayload{
		ID:                    inbox.ID,
		Name:                  inbox.Name,
		Type:                  string(inbox.Type),
		Description:           inbox.Description,
		CompanyID:             inbox.CompanyID,
		Enabled:               inbox.Enabled,
		AutoAssignmentEnabled: inbox.AutoAssignmentEnabled,
		MaxAutoAssignments:    inbox.MaxAutoAssignments,
		AutoResponderEnabled:  inbox.AutoResponderEnabled,
		AutoResponderMessage:  inbox.AutoResponderMessage,
	}

	// Add public-facing type-specific fields based on inbox type
	switch inbox.Type {
	case InboxTypeWebChat:
		if inbox.WebChat != nil {
			payload.WelcomeMessage = inbox.WebChat.WelcomeMessage
			payload.OutsideHoursMessage = inbox.WebChat.OutsideHoursMessage
			payload.WidgetCustomization = inbox.WebChat.WidgetCustomization
			payload.PreChatForm = &inbox.WebChat.PreChatForm

			// Handle working hours
			workingHours := inbox.WebChat.WorkingHours
			if workingHours != nil {
				payload.WorkingHours = workingHours

				// Determine if working hours are enabled
				workingHoursEnabled := false
				for _, wh := range workingHours {
					if wh.Enabled {
						workingHoursEnabled = true
						break
					}
				}
				payload.WorkingHoursEnabled = workingHoursEnabled
			}
		}
	case InboxTypeEmail:
		if inbox.Email != nil {
			// Use the new statically typed fields
			payload.ImapServer = inbox.Email.ImapServer
			payload.ImapPort = inbox.Email.ImapPort
			payload.SmtpServer = inbox.Email.SmtpServer
			payload.SmtpPort = inbox.Email.SmtpPort
			payload.Username = inbox.Email.Username
		}
	}

	return payload
}

// GetInboxesByUserID retrieves all inboxes associated with a user
func GetInboxesByUserID(db *gorm.DB, userID string) ([]Inbox, error) {
	var inboxes []Inbox

	// Query inboxes that are associated with the user through the inbox_users join table
	err := db.Joins("JOIN inbox_users ON inbox_users.inbox_id = inboxes.id").
		Where("inbox_users.user_id = ?", userID).
		Find(&inboxes).Error

	return inboxes, err
}

// GetInboxesByUserIDWithPreload retrieves all inboxes associated with a user
// and preloads the related users for each inbox and type-specific configurations
func GetInboxesByUserIDWithPreload(db *gorm.DB, userID string) ([]Inbox, error) {
	var inboxes []Inbox

	// Query inboxes and preload the users and type-specific configurations
	err := db.Joins("JOIN inbox_users ON inbox_users.inbox_id = inboxes.id").
		Where("inbox_users.user_id = ?", userID).
		Preload("Users").
		Preload("WebChat").
		Preload("Email").
		Find(&inboxes).Error

	return inboxes, err
}
