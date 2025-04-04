package repositories

import (
	"live-chat-server/models"

	"gorm.io/gorm"
)

type ConversationRepository interface {
	GetConversationsByCompanyID(companyID string) ([]models.Conversation, error)
	GetConversationByID(id string, preloads ...string) (*models.Conversation, error)
	UpdateConversation(conversation *models.Conversation) error
}

type conversationRepository struct {
	db *gorm.DB
}

func NewConversationRepository(db *gorm.DB) ConversationRepository {
	return &conversationRepository{db: db}
}

func (r *conversationRepository) GetConversationsByCompanyID(companyID string) ([]models.Conversation, error) {
	var conversations []models.Conversation
	if err := r.db.Where("company_id = ?", companyID).Find(&conversations).Error; err != nil {
		return nil, err
	}
	return conversations, nil
}

func (r *conversationRepository) GetConversationByID(id string, preloads ...string) (*models.Conversation, error) {
	var conversation models.Conversation
	query := r.db
	for _, preload := range preloads {
		query = query.Preload(preload)
	}
	if err := query.First(&conversation, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &conversation, nil
}

func (r *conversationRepository) UpdateConversation(conversation *models.Conversation) error {
	return r.db.Save(conversation).Error
}
