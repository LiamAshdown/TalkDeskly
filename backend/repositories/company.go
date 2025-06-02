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
	CreateCompanyInvite(invite *models.CompanyInvite) error
	GetCompanyInvites(companyID string) ([]*models.CompanyInvite, error)
	GetCompanyInviteByToken(token string) (*models.CompanyInvite, error)
	GetCompanyInviteByEmail(email string) (*models.CompanyInvite, error)
	GetCompanyInviteByID(id string) (*models.CompanyInvite, error)

	// SuperAdmin methods
	GetAllCompanies(page, limit int, search string) ([]models.Company, int64, error)
	GetAllCompaniesCount() (int64, error)
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

func (r *companyRepository) CreateCompanyInvite(invite *models.CompanyInvite) error {
	return r.db.Create(invite).Error
}

func (r *companyRepository) GetCompanyInvites(companyID string) ([]*models.CompanyInvite, error) {
	var invites []*models.CompanyInvite
	if err := r.db.Preload("Company").Preload("User").Where("company_id = ?", companyID).Find(&invites).Error; err != nil {
		return nil, err
	}
	return invites, nil
}

func (r *companyRepository) GetCompanyInviteByToken(token string) (*models.CompanyInvite, error) {
	var invite models.CompanyInvite
	if err := r.db.Preload("Company").Preload("User").Where("token = ?", token).First(&invite).Error; err != nil {
		return nil, err
	}
	return &invite, nil
}

func (r *companyRepository) GetCompanyInviteByEmail(email string) (*models.CompanyInvite, error) {
	var invite models.CompanyInvite
	if err := r.db.Preload("Company").Preload("User").Where("email = ?", email).First(&invite).Error; err != nil {
		return nil, err
	}
	return &invite, nil
}

func (r *companyRepository) GetCompanyInviteByID(id string) (*models.CompanyInvite, error) {
	var invite models.CompanyInvite
	if err := r.db.Preload("Company").Preload("User").Where("id = ?", id).First(&invite).Error; err != nil {
		return nil, err
	}

	return &invite, nil
}

func (r *companyRepository) GetAllCompanies(page, limit int, search string) ([]models.Company, int64, error) {
	var companies []models.Company
	var total int64

	query := r.db.Model(&models.Company{})

	if search != "" {
		query = query.Where("name ILIKE ? OR email ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&companies).Error; err != nil {
		return nil, 0, err
	}

	return companies, total, nil
}

func (r *companyRepository) GetAllCompaniesCount() (int64, error) {
	var total int64
	if err := r.db.Model(&models.Company{}).Count(&total).Error; err != nil {
		return 0, err
	}
	return total, nil
}
