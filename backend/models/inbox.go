package models

import (
	"live-chat-server/types"
	"time"

	"gorm.io/gorm"
)

type InboxType string

const (
	InboxTypeWebChat InboxType = "web_chat"
)

type Inbox struct {
	ID                    string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	CompanyID             string    `gorm:"type:uuid"`
	Name                  string    `gorm:"not null"`
	Type                  InboxType `gorm:"not null"`
	WelcomeMessage        string
	Description           string
	Enabled               bool `gorm:"default:true"`
	AutoAssignmentEnabled bool `gorm:"default:false"`
	MaxAutoAssignments    int  `gorm:"default:1"`
	AutoResponderEnabled  bool `gorm:"default:false"`
	AutoResponderMessage  string
	WorkingHours          types.WorkingHoursMap `gorm:"type:jsonb"` // Key is day of week (Monday, Tuesday, etc.)
	OutsideHoursMessage   string
	WidgetCustomization   types.WidgetCustomization `gorm:"type:jsonb"`
	Users                 []User                    `gorm:"many2many:inbox_users;"`
	CreatedAt             time.Time
	UpdatedAt             time.Time
	DeletedAt             gorm.DeletedAt `gorm:"index" json:"-"`
	Company               Company        `gorm:"foreignKey:CompanyID"`
}

func (inbox *Inbox) ToResponse() types.InboxPayload {
	users := make([]types.UserInboxPayload, len(inbox.Users))
	for i, user := range inbox.Users {
		users[i] = types.UserInboxPayload{
			ID:   user.ID,
			Name: user.FirstName + " " + user.LastName,
		}
	}

	// Default working hours if null
	workingHours := inbox.WorkingHours
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

	return types.InboxPayload{
		ID:                    inbox.ID,
		Name:                  inbox.Name,
		WelcomeMessage:        inbox.WelcomeMessage,
		Description:           inbox.Description,
		CompanyID:             inbox.CompanyID,
		Enabled:               inbox.Enabled,
		AutoAssignmentEnabled: inbox.AutoAssignmentEnabled,
		MaxAutoAssignments:    inbox.MaxAutoAssignments,
		AutoResponderEnabled:  inbox.AutoResponderEnabled,
		AutoResponderMessage:  inbox.AutoResponderMessage,
		WorkingHours:          workingHours,
		OutsideHoursMessage:   inbox.OutsideHoursMessage,
		WidgetCustomization:   inbox.WidgetCustomization,
		UserCount:             len(inbox.Users),
		CreatedAt:             inbox.CreatedAt.Format("02-01-2006 15:04:05"),
		UpdatedAt:             inbox.UpdatedAt.Format("02-01-2006 15:04:05"),
		Users:                 users,
	}
}

func (inbox *Inbox) ToPayload() types.InboxPayload {
	return inbox.ToResponse()
}

func (inbox *Inbox) ToPublicPayload() types.InboxPayload {
	return types.InboxPayload{
		ID:                    inbox.ID,
		Name:                  inbox.Name,
		WelcomeMessage:        inbox.WelcomeMessage,
		Description:           inbox.Description,
		CompanyID:             inbox.CompanyID,
		Enabled:               inbox.Enabled,
		AutoAssignmentEnabled: inbox.AutoAssignmentEnabled,
		MaxAutoAssignments:    inbox.MaxAutoAssignments,
		AutoResponderEnabled:  inbox.AutoResponderEnabled,
		AutoResponderMessage:  inbox.AutoResponderMessage,
		WorkingHours:          inbox.WorkingHours,
		OutsideHoursMessage:   inbox.OutsideHoursMessage,
		WidgetCustomization:   inbox.WidgetCustomization,
	}
}
