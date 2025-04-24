package repositories

import (
	"live-chat-server/models"

	"gorm.io/gorm"
)

type CannedResponseRepository interface {
	CreateCannedResponse(cannedResponse *models.CannedResponse) error
	GetCannedResponsesByCompanyID(companyID string) ([]*models.CannedResponse, error)
	GetCannedResponseByIDAndCompanyID(id string, companyID string) (*models.CannedResponse, error)
	UpdateCannedResponse(cannedResponse *models.CannedResponse) error
	DeleteCannedResponse(id string) error
}

type cannedResponseRepository struct {
	db *gorm.DB
}

func NewCannedResponseRepository(db *gorm.DB) *cannedResponseRepository {
	return &cannedResponseRepository{db: db}
}

func (r *cannedResponseRepository) CreateCannedResponse(cannedResponse *models.CannedResponse) error {
	return r.db.Create(cannedResponse).Error
}

func (r *cannedResponseRepository) GetCannedResponsesByCompanyID(companyID string) ([]*models.CannedResponse, error) {
	var cannedResponses []*models.CannedResponse
	if err := r.db.Where("company_id = ?", companyID).Find(&cannedResponses).Error; err != nil {
		return nil, err
	}
	return cannedResponses, nil
}

func (r *cannedResponseRepository) GetCannedResponseByID(id string) (*models.CannedResponse, error) {
	var cannedResponse models.CannedResponse
	if err := r.db.Where("id = ?", id).First(&cannedResponse).Error; err != nil {
		return nil, err
	}
	return &cannedResponse, nil
}

func (r *cannedResponseRepository) GetCannedResponseByIDAndCompanyID(id string, companyID string) (*models.CannedResponse, error) {
	var cannedResponse models.CannedResponse
	if err := r.db.Where("id = ? AND company_id = ?", id, companyID).First(&cannedResponse).Error; err != nil {
		return nil, err
	}
	return &cannedResponse, nil
}

func (r *cannedResponseRepository) UpdateCannedResponse(cannedResponse *models.CannedResponse) error {
	return r.db.Save(cannedResponse).Error
}

func (r *cannedResponseRepository) DeleteCannedResponse(id string) error {
	return r.db.Delete(&models.CannedResponse{}, id).Error
}
