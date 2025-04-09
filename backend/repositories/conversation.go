package repositories

import (
	"live-chat-server/models"

	"gorm.io/gorm"
)

type ConversationRepository interface {
	GetConversationsByCompanyID(companyID string, preloads ...string) ([]models.Conversation, error)
	GetConversationByIdAndCompanyID(id string, companyID string, preloads ...string) (*models.Conversation, error)
	GetConversationByID(id string, preloads ...string) (*models.Conversation, error)
	CreateConversation(conversation *models.Conversation) error
	UpdateConversation(conversation *models.Conversation) error
	CreateMessage(message *models.Message) error
}

type conversationRepository struct {
	db *gorm.DB
}

func NewConversationRepository(db *gorm.DB) ConversationRepository {
	return &conversationRepository{db: db}
}

// applyPreloads applies preloads to the query, with special handling for messages ordering
func (r *conversationRepository) ApplyPreloads(query *gorm.DB, preloads ...string) *gorm.DB {
	for _, preload := range preloads {
		// Special handling for Messages to order by date
		if preload == "Messages" {
			query = query.Preload(preload, func(db *gorm.DB) *gorm.DB {
				return db.Order("created_at ASC")
			})
		} else {
			query = query.Preload(preload)
		}
	}
	return query
}

func (r *conversationRepository) GetConversationsByCompanyID(companyID string, preloads ...string) ([]models.Conversation, error) {
	var conversations []models.Conversation
	query := r.db.Where("company_id = ?", companyID)
	query = r.ApplyPreloads(query, preloads...)
	if err := query.Find(&conversations).Error; err != nil {
		return nil, err
	}
	return conversations, nil
}

func (r *conversationRepository) GetConversationByIdAndCompanyID(id string, companyID string, preloads ...string) (*models.Conversation, error) {
	var conversation models.Conversation
	query := r.db.Where("id = ? AND company_id = ?", id, companyID)
	query = r.ApplyPreloads(query, preloads...)
	if err := query.First(&conversation).Error; err != nil {
		return nil, err
	}
	return &conversation, nil
}

func (r *conversationRepository) CreateConversation(conversation *models.Conversation) error {
	return r.db.Create(conversation).Error
}

func (r *conversationRepository) GetConversationByID(id string, preloads ...string) (*models.Conversation, error) {
	var conversation models.Conversation
	query := r.db
	query = r.ApplyPreloads(query, preloads...)
	if err := query.First(&conversation, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &conversation, nil
}

func (r *conversationRepository) UpdateConversation(conversation *models.Conversation) error {
	return r.db.Save(conversation).Error
}

func (r *conversationRepository) CreateMessage(message *models.Message) error {
	return r.db.Create(message).Error
}
