package repositories

import (
	"live-chat-server/models"
	"time"

	"gorm.io/gorm"
)

// AuditFilter represents filters for querying audit logs
type AuditFilter struct {
	UserID     *string
	Action     *string
	Level      *string
	Resource   *string
	ResourceID *string
	IPAddress  *string
	StartDate  *time.Time
	EndDate    *time.Time
	Search     *string
	Page       int
	Limit      int
	SortBy     string
	SortOrder  string
}

// AuditRepository defines the interface for audit operations
type AuditRepository interface {
	Create(auditLog *models.AuditLog) (*models.AuditLog, error)
	GetByID(id string) (*models.AuditLog, error)
	GetByFilter(filter AuditFilter) ([]models.AuditLog, int64, error)
	GetByCompanyID(companyID string, filter AuditFilter) ([]models.AuditLog, int64, error)
	GetByUserID(userID string, filter AuditFilter) ([]models.AuditLog, int64, error)
	GetSystemLogs(filter AuditFilter) ([]models.AuditLog, int64, error)
	DeleteOldLogs(olderThan time.Time) error
	GetStatistics(companyID *string, startDate, endDate time.Time) (map[string]interface{}, error)
}

type auditRepository struct {
	db *gorm.DB
}

// NewAuditRepository creates a new audit repository
func NewAuditRepository(db *gorm.DB) AuditRepository {
	return &auditRepository{db: db}
}

// Create creates a new audit log entry
func (r *auditRepository) Create(auditLog *models.AuditLog) (*models.AuditLog, error) {
	if err := r.db.Create(auditLog).Error; err != nil {
		return nil, err
	}
	return auditLog, nil
}

// GetByID retrieves an audit log by ID
func (r *auditRepository) GetByID(id string) (*models.AuditLog, error) {
	var auditLog models.AuditLog
	if err := r.db.Preload("User.Company").First(&auditLog, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &auditLog, nil
}

// GetByFilter retrieves audit logs based on filter criteria
func (r *auditRepository) GetByFilter(filter AuditFilter) ([]models.AuditLog, int64, error) {
	var auditLogs []models.AuditLog
	var total int64

	query := r.db.Model(&models.AuditLog{}).Preload("User.Company")

	// Apply filters
	query = r.applyFilters(query, filter)

	// Count total records
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination and sorting
	query = r.applySortingAndPagination(query, filter)

	// Execute query
	if err := query.Find(&auditLogs).Error; err != nil {
		return nil, 0, err
	}

	return auditLogs, total, nil
}

// GetByCompanyID retrieves audit logs for a specific company
func (r *auditRepository) GetByCompanyID(companyID string, filter AuditFilter) ([]models.AuditLog, int64, error) {
	var auditLogs []models.AuditLog
	var total int64

	query := r.db.Model(&models.AuditLog{}).
		Joins("LEFT JOIN users ON audit_logs.user_id = users.id").
		Where("users.company_id = ? OR audit_logs.user_id IS NULL", companyID).
		Preload("User.Company")

	// Apply filters
	query = r.applyFilters(query, filter)

	// Count total records
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination and sorting
	query = r.applySortingAndPagination(query, filter)

	// Execute query
	if err := query.Find(&auditLogs).Error; err != nil {
		return nil, 0, err
	}

	return auditLogs, total, nil
}

// GetByUserID retrieves audit logs for a specific user
func (r *auditRepository) GetByUserID(userID string, filter AuditFilter) ([]models.AuditLog, int64, error) {
	filter.UserID = &userID
	return r.GetByFilter(filter)
}

// GetSystemLogs retrieves system-level audit logs (where UserID is null)
func (r *auditRepository) GetSystemLogs(filter AuditFilter) ([]models.AuditLog, int64, error) {
	var auditLogs []models.AuditLog
	var total int64

	query := r.db.Model(&models.AuditLog{}).Where("user_id IS NULL").Preload("User.Company")

	// Apply filters (excluding UserID since we want system logs)
	filter.UserID = nil
	query = r.applyFilters(query, filter)

	// Count total records
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination and sorting
	query = r.applySortingAndPagination(query, filter)

	// Execute query
	if err := query.Find(&auditLogs).Error; err != nil {
		return nil, 0, err
	}

	return auditLogs, total, nil
}

// DeleteOldLogs deletes audit logs older than the specified date
func (r *auditRepository) DeleteOldLogs(olderThan time.Time) error {
	return r.db.Where("created_at < ?", olderThan).Delete(&models.AuditLog{}).Error
}

// GetStatistics returns audit statistics for a given time period
func (r *auditRepository) GetStatistics(companyID *string, startDate, endDate time.Time) (map[string]interface{}, error) {
	var stats map[string]interface{} = make(map[string]interface{})

	query := r.db.Model(&models.AuditLog{}).Where("created_at BETWEEN ? AND ?", startDate, endDate)

	if companyID != nil {
		query = query.Joins("LEFT JOIN users ON audit_logs.user_id = users.id").
			Where("users.company_id = ? OR audit_logs.user_id IS NULL", *companyID)
	}

	// Total logs count
	var totalLogs int64
	if err := query.Count(&totalLogs).Error; err != nil {
		return nil, err
	}
	stats["total_logs"] = totalLogs

	// Logs by action
	var actionStats []struct {
		Action string `json:"action"`
		Count  int64  `json:"count"`
	}
	if err := query.Select("action, COUNT(*) as count").Group("action").Order("count DESC").Scan(&actionStats).Error; err != nil {
		return nil, err
	}
	stats["by_action"] = actionStats

	// Logs by level
	var levelStats []struct {
		Level string `json:"level"`
		Count int64  `json:"count"`
	}
	if err := query.Select("level, COUNT(*) as count").Group("level").Order("count DESC").Scan(&levelStats).Error; err != nil {
		return nil, err
	}
	stats["by_level"] = levelStats

	// Logs by user (top 10)
	var userStats []struct {
		UserID    *string `json:"user_id"`
		FirstName *string `json:"first_name"`
		LastName  *string `json:"last_name"`
		Email     *string `json:"email"`
		Count     int64   `json:"count"`
	}
	if err := r.db.Table("audit_logs").
		Select("audit_logs.user_id, users.first_name, users.last_name, users.email, COUNT(*) as count").
		Joins("LEFT JOIN users ON audit_logs.user_id = users.id").
		Where("audit_logs.created_at BETWEEN ? AND ?", startDate, endDate).
		Group("audit_logs.user_id, users.first_name, users.last_name, users.email").
		Order("count DESC").
		Limit(10).
		Scan(&userStats).Error; err != nil {
		return nil, err
	}
	stats["by_user"] = userStats

	// Daily activity
	var dailyStats []struct {
		Date  string `json:"date"`
		Count int64  `json:"count"`
	}
	if err := query.Select("DATE(created_at) as date, COUNT(*) as count").
		Group("DATE(created_at)").
		Order("date ASC").
		Scan(&dailyStats).Error; err != nil {
		return nil, err
	}
	stats["daily_activity"] = dailyStats

	return stats, nil
}

// applyFilters applies various filters to the query
func (r *auditRepository) applyFilters(query *gorm.DB, filter AuditFilter) *gorm.DB {
	if filter.UserID != nil {
		query = query.Where("audit_logs.user_id = ?", *filter.UserID)
	}

	if filter.Action != nil {
		query = query.Where("audit_logs.action = ?", *filter.Action)
	}

	if filter.Level != nil {
		query = query.Where("audit_logs.level = ?", *filter.Level)
	}

	if filter.Resource != nil {
		query = query.Where("audit_logs.resource = ?", *filter.Resource)
	}

	if filter.ResourceID != nil {
		query = query.Where("audit_logs.resource_id = ?", *filter.ResourceID)
	}

	if filter.IPAddress != nil {
		query = query.Where("audit_logs.ip_address = ?", *filter.IPAddress)
	}

	if filter.StartDate != nil {
		query = query.Where("audit_logs.created_at >= ?", *filter.StartDate)
	}

	if filter.EndDate != nil {
		query = query.Where("audit_logs.created_at <= ?", *filter.EndDate)
	}

	if filter.Search != nil && *filter.Search != "" {
		searchTerm := "%" + *filter.Search + "%"
		query = query.Where(
			"audit_logs.description ILIKE ? OR audit_logs.ip_address ILIKE ?",
			searchTerm, searchTerm,
		)
	}

	return query
}

// applySortingAndPagination applies sorting and pagination to the query
func (r *auditRepository) applySortingAndPagination(query *gorm.DB, filter AuditFilter) *gorm.DB {
	// Default sorting
	sortBy := "created_at"
	sortOrder := "DESC"

	if filter.SortBy != "" {
		sortBy = filter.SortBy
	}

	if filter.SortOrder != "" {
		sortOrder = filter.SortOrder
	}

	query = query.Order(sortBy + " " + sortOrder)

	// Pagination
	if filter.Page > 0 && filter.Limit > 0 {
		offset := (filter.Page - 1) * filter.Limit
		query = query.Offset(offset).Limit(filter.Limit)
	} else if filter.Limit > 0 {
		query = query.Limit(filter.Limit)
	}

	return query
}
