package types

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
)

type ContactPayload struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	Company   string `json:"company"`
	CompanyID string `json:"company_id"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type UserInboxPayload struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type WorkingHours struct {
	StartTime string `json:"start_time"` // Format: "HH:mm"
	EndTime   string `json:"end_time"`   // Format: "HH:mm"
	Enabled   bool   `json:"enabled"`
}

// WorkingHoursMap represents a map of working hours for each day
type WorkingHoursMap map[string]WorkingHours

type InboxPayload struct {
	ID                    string              `json:"id"`
	Name                  string              `json:"name"`
	WelcomeMessage        string              `json:"welcome_message"`
	Description           string              `json:"description"`
	CompanyID             string              `json:"company_id"`
	Enabled               bool                `json:"enabled"`
	AutoAssignmentEnabled bool                `json:"auto_assignment_enabled"`
	MaxAutoAssignments    int                 `json:"max_auto_assignments"`
	AutoResponderEnabled  bool                `json:"auto_responder_enabled"`
	AutoResponderMessage  string              `json:"auto_responder_message"`
	WorkingHours          WorkingHoursMap     `json:"working_hours"`
	OutsideHoursMessage   string              `json:"outside_hours_message"`
	WidgetCustomization   WidgetCustomization `json:"widget_customization"`
	UserCount             int                 `json:"user_count"`
	CreatedAt             string              `json:"created_at"`
	UpdatedAt             string              `json:"updated_at"`
	Users                 []UserInboxPayload  `json:"users"`
}

type InboxDeletedPayload struct {
	ID string `json:"id"`
}

type InboxUpdatedPayload struct {
	Inbox          interface{}
	RemovedUserIDs []string
}

type SenderType string

const (
	SenderTypeContact SenderType = "contact"
	SenderTypeAgent   SenderType = "agent"
)

type Sender struct {
	ID        string     `json:"id"`
	Name      string     `json:"name"`
	Type      SenderType `json:"type"`
	AvatarUrl string     `json:"avatar_url,omitempty"`
}

type MessagePayload struct {
	ConversationID string      `json:"conversation_id"`
	Name           string      `json:"name"`
	Content        string      `json:"content"`
	Sender         Sender      `json:"sender"`
	Type           string      `json:"type"`
	Metadata       interface{} `json:"metadata,omitempty"`
	Timestamp      string      `json:"timestamp"`
}

type ConversationPayload struct {
	InboxID        string `json:"inbox_id"`
	ConversationID string `json:"conversation_id"`
	Status         string `json:"status"`
	Contact        struct {
		ID        string `json:"id"`
		Name      string `json:"name"`
		Email     string `json:"email"`
		Phone     string `json:"phone"`
		CreatedAt string `json:"created_at"`
	} `json:"contact"`
	Messages []MessagePayload `json:"messages"`
	Agent    struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"agent"`
	Inbox struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"inbox"`
	UpdatedAt     string `json:"updated_at"`
	LastMessage   string `json:"last_message"`
	LastMessageAt string `json:"last_message_at"`
}

type ContactNotePayload struct {
	ID        string `json:"id"`
	Content   string `json:"content"`
	ContactID string `json:"contact_id"`
	UserID    string `json:"user_id"`
	User      struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"user"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

// Scan implements the sql.Scanner interface for WorkingHoursMap
func (w *WorkingHoursMap) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("failed to unmarshal WorkingHoursMap value: %v", value)
	}
	return json.Unmarshal(bytes, &w)
}

// Value implements the driver.Valuer interface for WorkingHoursMap
func (w WorkingHoursMap) Value() (driver.Value, error) {
	return json.Marshal(w)
}

type WidgetCustomization struct {
	PrimaryColor string `json:"primary_color"`
	Position     string `json:"position"`
}

func (w *WidgetCustomization) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("failed to unmarshal WidgetCustomization value: %v", value)
	}
	return json.Unmarshal(bytes, &w)
}

func (w WidgetCustomization) Value() (driver.Value, error) {
	return json.Marshal(w)
}
