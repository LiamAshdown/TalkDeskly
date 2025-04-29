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
	ID                    string             `json:"id"`
	Name                  string             `json:"name"`
	Type                  string             `json:"type"`
	Description           string             `json:"description"`
	CompanyID             string             `json:"company_id"`
	Enabled               bool               `json:"enabled"`
	AutoAssignmentEnabled bool               `json:"auto_assignment_enabled"`
	MaxAutoAssignments    int                `json:"max_auto_assignments"`
	AutoResponderEnabled  bool               `json:"auto_responder_enabled"`
	AutoResponderMessage  string             `json:"auto_responder_message"`
	UserCount             int                `json:"user_count"`
	CreatedAt             string             `json:"created_at"`
	UpdatedAt             string             `json:"updated_at"`
	Users                 []UserInboxPayload `json:"users"`

	// Web Chat specific fields
	WelcomeMessage      string              `json:"welcome_message,omitempty"`
	WorkingHours        WorkingHoursMap     `json:"working_hours,omitempty"`
	WorkingHoursEnabled bool                `json:"working_hours_enabled,omitempty"`
	OutsideHoursMessage string              `json:"outside_hours_message,omitempty"`
	WidgetCustomization WidgetCustomization `json:"widget_customization,omitempty"`
	PreChatForm         *PreChatForm        `json:"pre_chat_form,omitempty"`

	// Email specific fields
	ImapServer string `json:"imap_server,omitempty"`
	ImapPort   int    `json:"imap_port,omitempty"`
	SmtpServer string `json:"smtp_server,omitempty"`
	SmtpPort   int    `json:"smtp_port,omitempty"`
	Username   string `json:"username,omitempty"`

	// Used for any custom inbox-type configurations that don't have dedicated fields
	TypeConfig InboxTypeConfig `json:"type_config,omitempty"`
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
	SenderTypeSystem  SenderType = "system"
	SenderTypeBot     SenderType = "bot"
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
	Private        bool        `json:"private"`
	Metadata       interface{} `json:"metadata,omitempty"`
	Timestamp      string      `json:"timestamp"`
}

type AgentPayload struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Avatar string `json:"avatar"`
}

type ConversationPayload struct {
	ID             string      `json:"id"`
	InboxID        string      `json:"inbox_id"`
	ConversationID string      `json:"conversation_id"`
	Status         string      `json:"status"`
	Metadata       interface{} `json:"metadata"`
	AssignedTo     *struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"assigned_to,omitempty"`
	Contact struct {
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
	CreatedAt     string `json:"created_at"`
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

type IncomingSubscribePayload struct {
	Topic string `json:"topic"`
}

type IncomingUnsubscribePayload struct {
	Topic string `json:"topic"`
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

// PreChatFormField represents a field in the pre-chat form
type PreChatFormField struct {
	ID           string   `json:"id"`
	Type         string   `json:"type"` // text, email, phone, select, textarea
	Label        string   `json:"label"`
	Placeholder  string   `json:"placeholder"`
	Required     bool     `json:"required"`
	Options      []string `json:"options,omitempty"`       // For select fields
	ContactField string   `json:"contact_field,omitempty"` // Maps to a contact property: "name", "email", "phone"
	Value        string   `json:"value,omitempty"`         // The actual value of the field
}

// PreChatForm represents the pre-chat form configuration
type PreChatForm struct {
	Enabled     bool               `json:"enabled"`
	Title       string             `json:"title"`
	Description string             `json:"description"`
	Fields      []PreChatFormField `json:"fields"`
}

// Scan implements the sql.Scanner interface for PreChatForm
func (p *PreChatForm) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("failed to unmarshal PreChatForm value: %v", value)
	}
	return json.Unmarshal(bytes, &p)
}

// Value implements the driver.Valuer interface for PreChatForm
func (p PreChatForm) Value() (driver.Value, error) {
	return json.Marshal(p)
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

// InboxTypeConfig stores configuration specific to different inbox types
type InboxTypeConfig map[string]interface{}

// Scan implements the sql.Scanner interface for InboxTypeConfig
func (i *InboxTypeConfig) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("failed to unmarshal InboxTypeConfig value: %v", value)
	}
	return json.Unmarshal(bytes, &i)
}

// Value implements the driver.Valuer interface for InboxTypeConfig
func (i InboxTypeConfig) Value() (driver.Value, error) {
	return json.Marshal(i)
}
