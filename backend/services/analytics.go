package services

import (
	"live-chat-server/repositories"
	"time"
)

type AnalyticsService interface {
	GetConversationStats(companyID string, startDate, endDate time.Time) (*repositories.ConversationStats, error)
	GetConversationsByAgent(companyID string, startDate, endDate time.Time) ([]repositories.AgentConversationStats, error)
	GetMessageStats(companyID string, startDate, endDate time.Time) (*repositories.MessageStats, error)
	GetConversationStatusStats(companyID string, startDate, endDate time.Time) (*repositories.ConversationStatusStats, error)
	GetAnalyticsDashboard(companyID string, days int) (*AnalyticsDashboard, error)
}

type AnalyticsDashboard struct {
	ConversationStats       *repositories.ConversationStats       `json:"conversation_stats"`
	MessageStats            *repositories.MessageStats            `json:"message_stats"`
	ConversationStatusStats *repositories.ConversationStatusStats `json:"conversation_status_stats"`
	AgentStats              []repositories.AgentConversationStats `json:"agent_stats"`
	DateRange               DateRange                             `json:"date_range"`
}

type DateRange struct {
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
	Days      int    `json:"days"`
}

type analyticsService struct {
	analyticsRepo repositories.AnalyticsRepository
}

func NewAnalyticsService(analyticsRepo repositories.AnalyticsRepository) AnalyticsService {
	return &analyticsService{
		analyticsRepo: analyticsRepo,
	}
}

func (s *analyticsService) GetConversationStats(companyID string, startDate, endDate time.Time) (*repositories.ConversationStats, error) {
	return s.analyticsRepo.GetConversationStats(companyID, startDate, endDate)
}

func (s *analyticsService) GetConversationsByAgent(companyID string, startDate, endDate time.Time) ([]repositories.AgentConversationStats, error) {
	return s.analyticsRepo.GetConversationsByAgent(companyID, startDate, endDate)
}

func (s *analyticsService) GetMessageStats(companyID string, startDate, endDate time.Time) (*repositories.MessageStats, error) {
	return s.analyticsRepo.GetMessageStats(companyID, startDate, endDate)
}

func (s *analyticsService) GetConversationStatusStats(companyID string, startDate, endDate time.Time) (*repositories.ConversationStatusStats, error) {
	return s.analyticsRepo.GetConversationStatusStats(companyID, startDate, endDate)
}

func (s *analyticsService) GetAnalyticsDashboard(companyID string, days int) (*AnalyticsDashboard, error) {
	// Calculate date range
	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -days)

	// Get all analytics data
	conversationStats, err := s.GetConversationStats(companyID, startDate, endDate)
	if err != nil {
		return nil, err
	}

	messageStats, err := s.GetMessageStats(companyID, startDate, endDate)
	if err != nil {
		return nil, err
	}

	statusStats, err := s.GetConversationStatusStats(companyID, startDate, endDate)
	if err != nil {
		return nil, err
	}

	agentStats, err := s.GetConversationsByAgent(companyID, startDate, endDate)
	if err != nil {
		return nil, err
	}

	return &AnalyticsDashboard{
		ConversationStats:       conversationStats,
		MessageStats:            messageStats,
		ConversationStatusStats: statusStats,
		AgentStats:              agentStats,
		DateRange: DateRange{
			StartDate: startDate.Format("2006-01-02"),
			EndDate:   endDate.Format("2006-01-02"),
			Days:      days,
		},
	}, nil
}
