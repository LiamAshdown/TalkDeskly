package services

import (
	"fmt"
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/repositories"
	"time"

	"github.com/gofiber/fiber/v2"
)

// AuditService defines the interface for audit logging operations
type AuditService = interfaces.AuditService

type auditService struct {
	auditRepo repositories.AuditRepository
	logger    interfaces.Logger
}

// NewAuditService creates a new audit service
func NewAuditService(auditRepo repositories.AuditRepository, logger interfaces.Logger) AuditService {
	namedLogger := logger.Named("audit_service")
	return &auditService{
		auditRepo: auditRepo,
		logger:    namedLogger,
	}
}

// LogUserAction logs a user action
func (s *auditService) LogUserAction(userID, action, resource, resourceID, description string, metadata interface{}) error {
	auditLog := &models.AuditLog{
		UserID:      &userID,
		Action:      action,
		Level:       string(models.AuditLevelInfo),
		Resource:    resource,
		ResourceID:  &resourceID,
		Description: description,
	}

	if metadata != nil {
		if err := auditLog.SetMetadata(metadata); err != nil {
			s.logger.Error("Failed to set audit log metadata", fiber.Map{
				"error": err.Error(),
			})
		}
	}

	_, err := s.auditRepo.Create(auditLog)
	if err != nil {
		s.logger.Error("Failed to create audit log", fiber.Map{
			"action":   action,
			"resource": resource,
			"user_id":  userID,
			"error":    err.Error(),
		})
	}

	return err
}

// LogSystemEvent logs a system event
func (s *auditService) LogSystemEvent(action, resource, description string, metadata interface{}) error {
	auditLog := &models.AuditLog{
		Action:      action,
		Level:       string(models.AuditLevelInfo),
		Resource:    resource,
		Description: description,
	}

	if metadata != nil {
		if err := auditLog.SetMetadata(metadata); err != nil {
			s.logger.Error("Failed to set audit log metadata", fiber.Map{
				"error": err.Error(),
			})
		}
	}

	_, err := s.auditRepo.Create(auditLog)
	if err != nil {
		s.logger.Error("Failed to create system audit log", fiber.Map{
			"action":   action,
			"resource": resource,
			"error":    err.Error(),
		})
	}

	return err
}

// LogAuthEvent logs an authentication event
func (s *auditService) LogAuthEvent(userID *string, action, description string) error {
	auditLog := &models.AuditLog{
		UserID:      userID,
		Action:      action,
		Level:       string(models.AuditLevelInfo),
		Resource:    "authentication",
		Description: description,
	}

	if err := auditLog.SetMetadata(nil); err != nil {
		s.logger.Error("Failed to set audit log metadata", fiber.Map{
			"error": err.Error(),
		})
	}

	_, err := s.auditRepo.Create(auditLog)
	if err != nil {
		s.logger.Error("Failed to create auth audit log", fiber.Map{
			"action":  action,
			"user_id": userID,
			"error":   err.Error(),
		})
	}

	return err
}

// Convenience methods
func (s *auditService) LogLogin(userID string) error {
	auditLog := &models.AuditLog{
		UserID:      &userID,
		Action:      string(models.AuditActionLogin),
		Level:       string(models.AuditLevelInfo),
		Resource:    "authentication",
		Description: "User logged in successfully",
	}

	if err := auditLog.SetMetadata(nil); err != nil {
		s.logger.Error("Failed to set audit log metadata", fiber.Map{
			"error": err.Error(),
		})
	}

	_, err := s.auditRepo.Create(auditLog)
	return err
}

func (s *auditService) LogLogout(userID string) error {
	return s.LogUserAction(userID, string(models.AuditActionLogout), "authentication", "", "User logged out", nil)
}

func (s *auditService) LogFailedLogin(email string) error {
	auditLog := &models.AuditLog{
		Action:      string(models.AuditActionLoginFail),
		Level:       string(models.AuditLevelWarning),
		Resource:    "authentication",
		Description: fmt.Sprintf("Failed login attempt for email: %s", email),
	}

	metadata := map[string]interface{}{
		"success": false,
		"email":   email,
	}

	if err := auditLog.SetMetadata(metadata); err != nil {
		s.logger.Error("Failed to set audit log metadata", fiber.Map{
			"error": err.Error(),
		})
	}

	_, err := s.auditRepo.Create(auditLog)
	return err
}

func (s *auditService) LogUserCreate(actorUserID, createdUserID string, metadata interface{}) error {
	return s.LogUserAction(actorUserID, string(models.AuditActionUserCreate), "user",
		createdUserID, fmt.Sprintf("Created user %s", createdUserID), map[string]interface{}{
			"created_user_id": createdUserID,
			"additional":      metadata,
		})
}

func (s *auditService) LogUserUpdate(actorUserID, updatedUserID string, metadata interface{}) error {
	return s.LogUserAction(actorUserID, string(models.AuditActionUserUpdate), "user",
		updatedUserID, fmt.Sprintf("Updated user %s", updatedUserID), map[string]interface{}{
			"updated_user_id": updatedUserID,
			"additional":      metadata,
		})
}

func (s *auditService) LogUserDelete(actorUserID, deletedUserID string) error {
	return s.LogUserAction(actorUserID, string(models.AuditActionUserDelete), "user",
		deletedUserID, fmt.Sprintf("Deleted user %s", deletedUserID), map[string]interface{}{
			"deleted_user_id": deletedUserID,
		})
}

func (s *auditService) LogConversationAction(userID, conversationID, action string, metadata interface{}) error {
	return s.LogUserAction(userID, action, "conversation",
		conversationID, fmt.Sprintf("Conversation action: %s", action), map[string]interface{}{
			"conversation_id": conversationID,
			"additional":      metadata,
		})
}

func (s *auditService) LogMessageAction(userID, messageID, action string, metadata interface{}) error {
	return s.LogUserAction(userID, action, "message",
		messageID, fmt.Sprintf("Message action: %s", action), map[string]interface{}{
			"message_id": messageID,
			"additional": metadata,
		})
}

// Query methods
func (s *auditService) GetAuditLogs(filter repositories.AuditFilter) ([]models.AuditLog, int64, error) {
	return s.auditRepo.GetByFilter(filter)
}

func (s *auditService) GetUserAuditLogs(userID string, filter repositories.AuditFilter) ([]models.AuditLog, int64, error) {
	return s.auditRepo.GetByUserID(userID, filter)
}

func (s *auditService) GetCompanyAuditLogs(companyID string, filter repositories.AuditFilter) ([]models.AuditLog, int64, error) {
	return s.auditRepo.GetByCompanyID(companyID, filter)
}

func (s *auditService) GetSystemAuditLogs(filter repositories.AuditFilter) ([]models.AuditLog, int64, error) {
	return s.auditRepo.GetSystemLogs(filter)
}

func (s *auditService) GetAuditStatistics(companyID *string, startDate, endDate time.Time) (map[string]interface{}, error) {
	return s.auditRepo.GetStatistics(companyID, startDate, endDate)
}

// CleanupOldLogs removes audit logs older than the specified retention period
func (s *auditService) CleanupOldLogs(retentionDays int) error {
	cutoffDate := time.Now().AddDate(0, 0, -retentionDays)

	err := s.auditRepo.DeleteOldLogs(cutoffDate)
	if err != nil {
		s.logger.Error("Failed to cleanup old audit logs", fiber.Map{
			"cutoff_date":    cutoffDate,
			"retention_days": retentionDays,
			"error":          err.Error(),
		})
		return err
	}

	s.logger.Info("Successfully cleaned up old audit logs", fiber.Map{
		"cutoff_date":    cutoffDate,
		"retention_days": retentionDays,
	})

	return nil
}
