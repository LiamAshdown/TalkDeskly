package repositories

import (
	"live-chat-server/models"

	"gorm.io/gorm"
)

type UserRepository interface {
	GetUserByID(id string) (*models.User, error)
	GetUserByEmail(email string) (*models.User, error)
	GetUsersByCompanyID(companyID string) ([]models.User, error)
	CreateUser(user *models.User) error
	UpdateUser(user *models.User) error
	DeleteUser(id string) error
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) GetUserByID(id string) (*models.User, error) {
	var user models.User
	if err := r.db.Preload("Company").Preload("NotificationSettings").First(&user, "id = ?", id).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *userRepository) GetUsersByCompanyID(companyID string) ([]models.User, error) {
	var users []models.User
	if err := r.db.Preload("Company").Preload("NotificationSettings").Where("company_id = ?", companyID).Find(&users).Error; err != nil {
		return nil, err
	}

	return users, nil
}

func (r *userRepository) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.db.Preload("Company").Preload("NotificationSettings").First(&user, "email = ?", email).Error; err != nil {
		return nil, err
	}

	return &user, gorm.ErrRecordNotFound
}

func (r *userRepository) CreateUser(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *userRepository) UpdateUser(user *models.User) error {
	return r.db.Save(user).Error
}

func (r *userRepository) DeleteUser(id string) error {
	return r.db.Delete(&models.User{}, "id = ?", id).Error
}
