package repositories

import (
	"live-chat-server/models"

	"gorm.io/gorm"
)

type InboxRepository interface {
	GetInboxByID(id string) (*models.Inbox, error)
	GetInboxByIDAndCompanyID(id string, companyID string) (*models.Inbox, error)
	GetInboxesByCompanyID(companyID string) ([]models.Inbox, error)
	CreateInbox(inbox *models.Inbox) error
	UpdateInbox(inbox *models.Inbox) error
	DeleteInbox(id string) error
	DeleteInboxByIDAndCompanyID(id string, companyID string) error
	GetUsersForInbox(inboxID string) ([]models.User, error)
}

type inboxRepository struct {
	db *gorm.DB
}

func NewInboxRepository(db *gorm.DB) InboxRepository {
	return &inboxRepository{db: db}
}

func (r *inboxRepository) ApplyPreloads(query *gorm.DB, preloads ...string) *gorm.DB {
	for _, preload := range preloads {
		query = query.Preload(preload)
	}
	return query
}

func (r *inboxRepository) GetUsersForInbox(inboxID string) ([]models.User, error) {
	var inbox models.Inbox

	// Get users by inbox id
	err := r.db.Preload("Users").Where("id = ?", inboxID).First(&inbox).Error
	if err != nil {
		return nil, err
	}

	return inbox.Users, nil
}

func (r *inboxRepository) GetInboxByID(id string) (*models.Inbox, error) {
	var inbox models.Inbox
	if err := r.db.Preload("Users").First(&inbox, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &inbox, nil
}

func (r *inboxRepository) GetInboxByIDAndCompanyID(id string, companyID string) (*models.Inbox, error) {
	var inbox models.Inbox
	if err := r.db.Preload("Users").First(&inbox, "id = ? AND company_id = ?", id, companyID).Error; err != nil {
		return nil, err
	}
	return &inbox, nil
}

func (r *inboxRepository) GetInboxesByCompanyID(companyID string) ([]models.Inbox, error) {
	var inboxes []models.Inbox
	if err := r.db.Preload("Users").Where("company_id = ?", companyID).Find(&inboxes).Error; err != nil {
		return nil, err
	}
	return inboxes, nil
}

func (r *inboxRepository) CreateInbox(inbox *models.Inbox) error {
	return r.db.Create(inbox).Error
}

func (r *inboxRepository) UpdateInbox(inbox *models.Inbox) error {
	return r.db.Save(inbox).Error
}

func (r *inboxRepository) DeleteInbox(id string) error {
	return r.db.Delete(&models.Inbox{}, "id = ?", id).Error
}

func (r *inboxRepository) DeleteInboxByIDAndCompanyID(id string, companyID string) error {
	return r.db.Delete(&models.Inbox{}, "id = ? AND company_id = ?", id, companyID).Error
}
