package interfaces

// AuditService defines the interface for audit logging operations
type AuditService interface {
	// Log a user action
	LogUserAction(userID, action, resource, resourceID, description string, metadata interface{}) error

	// Log a system event
	LogSystemEvent(action, resource, description string, metadata interface{}) error

	// Log an authentication event
	LogAuthEvent(userID *string, action, description string) error

	// Convenience methods for common actions
	LogLogin(userID string) error
	LogLogout(userID string) error
	LogFailedLogin(email string) error
	LogUserCreate(actorUserID, createdUserID string, metadata interface{}) error
	LogUserUpdate(actorUserID, updatedUserID string, metadata interface{}) error
	LogUserDelete(actorUserID, deletedUserID string) error
	LogConversationAction(userID, conversationID, action string, metadata interface{}) error
	LogMessageAction(userID, messageID, action string, metadata interface{}) error
}
