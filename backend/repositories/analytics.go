package repositories

import (
	"live-chat-server/models"
	"time"

	"gorm.io/gorm"
)

type AnalyticsRepository interface {
	GetConversationStats(companyID string, startDate, endDate time.Time) (*ConversationStats, error)
	GetConversationsByAgent(companyID string, startDate, endDate time.Time) ([]AgentConversationStats, error)
	GetMessageStats(companyID string, startDate, endDate time.Time) (*MessageStats, error)
	GetConversationStatusStats(companyID string, startDate, endDate time.Time) (*ConversationStatusStats, error)
}

type ConversationStats struct {
	TotalConversations int64 `json:"total_conversations"`
	NewConversations   int64 `json:"new_conversations"`
}

type AgentConversationStats struct {
	AgentID        string `json:"agent_id"`
	AgentName      string `json:"agent_name"`
	TotalAssigned  int64  `json:"total_assigned"`
	ActiveAssigned int64  `json:"active_assigned"`
	ClosedAssigned int64  `json:"closed_assigned"`
}

type MessageStats struct {
	TotalMessages   int64   `json:"total_messages"`
	AgentMessages   int64   `json:"agent_messages"`
	ContactMessages int64   `json:"contact_messages"`
	AveragePerConvo float64 `json:"average_per_conversation"`
}

type ConversationStatusStats struct {
	Active   int64 `json:"active"`
	Pending  int64 `json:"pending"`
	Closed   int64 `json:"closed"`
	Resolved int64 `json:"resolved"`
}

type analyticsRepository struct {
	db *gorm.DB
}

func NewAnalyticsRepository(db *gorm.DB) AnalyticsRepository {
	return &analyticsRepository{db: db}
}

func (r *analyticsRepository) GetConversationStats(companyID string, startDate, endDate time.Time) (*ConversationStats, error) {
	var stats ConversationStats

	// Get total conversations in the time period
	err := r.db.Model(&models.Conversation{}).
		Where("company_id = ? AND created_at BETWEEN ? AND ?", companyID, startDate, endDate).
		Count(&stats.TotalConversations).Error
	if err != nil {
		return nil, err
	}

	// For new conversations, we consider those as the total in the time period
	stats.NewConversations = stats.TotalConversations

	return &stats, nil
}

func (r *analyticsRepository) GetConversationsByAgent(companyID string, startDate, endDate time.Time) ([]AgentConversationStats, error) {
	var results []AgentConversationStats

	// Get conversations assigned to agents
	rows, err := r.db.Raw(`
		SELECT 
			u.id as agent_id,
			CONCAT(u.first_name, ' ', u.last_name) as agent_name,
			COUNT(c.id) as total_assigned,
			COUNT(CASE WHEN c.status = 'active' THEN 1 END) as active_assigned,
			COUNT(CASE WHEN c.status = 'closed' THEN 1 END) as closed_assigned
		FROM users u
		LEFT JOIN conversations c ON u.id = c.assigned_to_id 
			AND c.company_id = ? 
			AND c.created_at BETWEEN ? AND ?
		WHERE u.company_id = ? AND u.role IN ('agent', 'admin')
		GROUP BY u.id, u.first_name, u.last_name
		ORDER BY total_assigned DESC
	`, companyID, startDate, endDate, companyID).Rows()

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var stat AgentConversationStats
		err := rows.Scan(&stat.AgentID, &stat.AgentName, &stat.TotalAssigned, &stat.ActiveAssigned, &stat.ClosedAssigned)
		if err != nil {
			return nil, err
		}
		results = append(results, stat)
	}

	return results, nil
}

func (r *analyticsRepository) GetMessageStats(companyID string, startDate, endDate time.Time) (*MessageStats, error) {
	var stats MessageStats

	// Get total messages
	err := r.db.Raw(`
		SELECT 
			COUNT(*) as total_messages,
			COUNT(CASE WHEN m.sender_type = 'agent' THEN 1 END) as agent_messages,
			COUNT(CASE WHEN m.sender_type = 'contact' THEN 1 END) as contact_messages
		FROM messages m
		JOIN conversations c ON m.conversation_id = c.id
		WHERE c.company_id = ? AND m.created_at BETWEEN ? AND ?
	`, companyID, startDate, endDate).Scan(&stats).Error

	if err != nil {
		return nil, err
	}

	// Calculate average messages per conversation
	var totalConversations int64
	err = r.db.Model(&models.Conversation{}).
		Where("company_id = ? AND created_at BETWEEN ? AND ?", companyID, startDate, endDate).
		Count(&totalConversations).Error
	if err != nil {
		return nil, err
	}

	if totalConversations > 0 {
		stats.AveragePerConvo = float64(stats.TotalMessages) / float64(totalConversations)
	}

	return &stats, nil
}

func (r *analyticsRepository) GetConversationStatusStats(companyID string, startDate, endDate time.Time) (*ConversationStatusStats, error) {
	var stats ConversationStatusStats

	err := r.db.Raw(`
		SELECT 
			COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
			COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
			COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed,
			COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved
		FROM conversations
		WHERE company_id = ? AND created_at BETWEEN ? AND ?
	`, companyID, startDate, endDate).Scan(&stats).Error

	return &stats, err
}
