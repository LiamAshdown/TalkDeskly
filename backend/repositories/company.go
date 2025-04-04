package repositories

import (
	"live-chat-server/models"

	"gorm.io/gorm"
)

type CompanyRepository interface {
	CreateCompany(company *models.Company) error
	GetCompanyByID(id string) (*models.Company, error)
	GetCompanyByEmail(email string) (*models.Company, error)
	GetCompanyByName(name string) (*models.Company, error)
	UpdateCompany(company *models.Company) error
	DeleteCompany(id string) error
}

type companyRepository struct {
	db *gorm.DB
}

func NewCompanyRepository(db *gorm.DB) CompanyRepository {
	return &companyRepository{db: db}
}

func (r *companyRepository) CreateCompany(company *models.Company) error {
	return r.db.Create(company).Error
}

func (r *companyRepository) GetCompanyByID(id string) (*models.Company, error) {
	var company models.Company
	if err := r.db.First(&company, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &company, nil
}

func (r *companyRepository) GetCompanyByEmail(email string) (*models.Company, error) {
	var company models.Company
	if err := r.db.First(&company, "email = ?", email).Error; err != nil {
		return nil, err
	}
	return &company, nil
}

func (r *companyRepository) GetCompanyByName(name string) (*models.Company, error) {
	var company models.Company
	if err := r.db.First(&company, "name = ?", name).Error; err != nil {
		return nil, err
	}
	return &company, nil
}

func (r *companyRepository) UpdateCompany(company *models.Company) error {
	return r.db.Save(company).Error
}

func (r *companyRepository) DeleteCompany(id string) error {
	return r.db.Delete(&models.Company{}, "id = ?", id).Error
}
