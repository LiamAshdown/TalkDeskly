package models

import (
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

// AuditAction represents the type of action being audited
type AuditAction string

const (
	// Authentication actions
	AuditActionLogin     AuditAction = "login"
	AuditActionLogout    AuditAction = "logout"
	AuditActionLoginFail AuditAction = "login_fail"

	// User management actions
	AuditActionUserCreate AuditAction = "user_create"
	AuditActionUserUpdate AuditAction = "user_update"
	AuditActionUserDelete AuditAction = "user_delete"
	AuditActionUserView   AuditAction = "user_view"

	// Company management actions
	AuditActionCompanyCreate AuditAction = "company_create"
	AuditActionCompanyUpdate AuditAction = "company_update"
	AuditActionCompanyDelete AuditAction = "company_delete"

	// Conversation actions
	AuditActionConversationCreate  AuditAction = "conversation_create"
	AuditActionConversationUpdate  AuditAction = "conversation_update"
	AuditActionConversationAssign  AuditAction = "conversation_assign"
	AuditActionConversationResolve AuditAction = "conversation_resolve"
	AuditActionConversationDelete  AuditAction = "conversation_delete"

	// Message actions
	AuditActionMessageSend   AuditAction = "message_send"
	AuditActionMessageEdit   AuditAction = "message_edit"
	AuditActionMessageDelete AuditAction = "message_delete"

	// Inbox actions
	AuditActionInboxCreate AuditAction = "inbox_create"
	AuditActionInboxUpdate AuditAction = "inbox_update"
	AuditActionInboxDelete AuditAction = "inbox_delete"

	// Contact actions
	AuditActionContactCreate     AuditAction = "contact_create"
	AuditActionContactUpdate     AuditAction = "contact_update"
	AuditActionContactDelete     AuditAction = "contact_delete"
	AuditActionContactNoteCreate AuditAction = "contact_note_create"

	// File actions
	AuditActionFileUpload AuditAction = "file_upload"
	AuditActionFileDelete AuditAction = "file_delete"

	// Settings actions
	AuditActionSettingsUpdate AuditAction = "settings_update"

	// System actions
	AuditActionSystemStart AuditAction = "system_start"
	AuditActionSystemStop  AuditAction = "system_stop"

	// API access
	AuditActionAPIAccess AuditAction = "api_access"
)

// AuditLevel represents the severity level of an audit event
type AuditLevel string

const (
	AuditLevelInfo     AuditLevel = "info"
	AuditLevelWarning  AuditLevel = "warning"
	AuditLevelError    AuditLevel = "error"
	AuditLevelCritical AuditLevel = "critical"
)

// AuditLog represents an audit log entry
type AuditLog struct {
	ID          string                 `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID      *string                `json:"user_id,omitempty" gorm:"type:uuid;index"`
	Action      string                 `json:"action" gorm:"not null;index"`
	Level       string                 `json:"level" gorm:"not null;index;default:'info'"`
	Resource    string                 `json:"resource" gorm:"not null;index"`
	ResourceID  *string                `json:"resource_id,omitempty" gorm:"index"`
	Description string                 `json:"description" gorm:"text"`
	Metadata    map[string]interface{} `json:"metadata,omitempty" gorm:"type:jsonb;serializer:json"`
	CreatedAt   time.Time              `json:"created_at" gorm:"index"`
	UpdatedAt   time.Time              `json:"updated_at"`
	DeletedAt   gorm.DeletedAt         `json:"-" gorm:"index"`

	// Relationships
	User *User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// TableName specifies the table name for AuditLog
func (AuditLog) TableName() string {
	return "audit_logs"
}

// SetMetadata sets the metadata field with proper JSON encoding
func (al *AuditLog) SetMetadata(data interface{}) error {
	if data == nil {
		al.Metadata = nil
		return nil
	}

	// If it's already a map, use it directly
	if metadata, ok := data.(map[string]interface{}); ok {
		al.Metadata = metadata
		return nil
	}

	// Otherwise, marshal and unmarshal to ensure it's properly formatted
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	var metadata map[string]interface{}
	if err := json.Unmarshal(jsonData, &metadata); err != nil {
		return err
	}

	al.Metadata = metadata
	return nil
}

// ToResponse returns a response-safe representation of the audit log
func (al *AuditLog) ToResponse() map[string]interface{} {
	response := map[string]interface{}{
		"id":          al.ID,
		"user_id":     al.UserID,
		"action":      al.Action,
		"level":       al.Level,
		"resource":    al.Resource,
		"resource_id": al.ResourceID,
		"description": al.Description,
		"metadata":    al.Metadata,
		"created_at":  al.CreatedAt,
		"updated_at":  al.UpdatedAt,
	}

	if al.User != nil {
		response["user"] = map[string]interface{}{
			"id":         al.User.ID,
			"first_name": al.User.FirstName,
			"last_name":  al.User.LastName,
			"email":      al.User.Email,
		}

		// Include company info through user relationship
		if al.User.Company != nil {
			response["company"] = map[string]interface{}{
				"id":   al.User.Company.ID,
				"name": al.User.Company.Name,
			}
		}
	}

	return response
}
