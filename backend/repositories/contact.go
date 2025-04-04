package repositories

import (
	"live-chat-server/models"

	"gorm.io/gorm"
)

type ContactRepository interface {
	GetContactByID(id string) (*models.Contact, error)
	GetContactByIDAndCompanyID(id string, companyID string) (*models.Contact, error)
	GetContactsByCompanyID(companyID string) ([]models.Contact, error)
	CreateContact(contact *models.Contact) error
	UpdateContact(contact *models.Contact) error
	DeleteContact(id string) error
	DeleteContactByIDAndCompanyID(id string, companyID string) error
}

type contactRepository struct {
	db *gorm.DB
}

func NewContactRepository(db *gorm.DB) ContactRepository {
	return &contactRepository{db: db}
}

func (r *contactRepository) GetContactByID(id string) (*models.Contact, error) {
	var contact models.Contact
	if err := r.db.First(&contact, "id = ?", id).Error; err != nil {
		return nil, err
	}

	return &contact, nil
}

func (r *contactRepository) GetContactByIDAndCompanyID(id string, companyID string) (*models.Contact, error) {
	var contact models.Contact
	if err := r.db.First(&contact, "id = ? AND company_id = ?", id, companyID).Error; err != nil {
		return nil, err
	}
	return &contact, nil
}

func (r *contactRepository) GetContactsByCompanyID(companyID string) ([]models.Contact, error) {
	var contacts []models.Contact
	if err := r.db.Where("company_id = ?", companyID).Find(&contacts).Error; err != nil {
		return nil, err
	}

	return contacts, nil
}

func (r *contactRepository) CreateContact(contact *models.Contact) error {
	return r.db.Create(contact).Error
}

func (r *contactRepository) UpdateContact(contact *models.Contact) error {
	return r.db.Save(contact).Error
}

func (r *contactRepository) DeleteContact(id string) error {
	return r.db.Delete(&models.Contact{}, "id = ?", id).Error
}

func (r *contactRepository) DeleteContactByIDAndCompanyID(id string, companyID string) error {
	return r.db.Delete(&models.Contact{}, "id = ? AND company_id = ?", id, companyID).Error
}
