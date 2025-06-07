package repositories

import (
	"fmt"
	"live-chat-server/models"

	"gorm.io/gorm"
)

type UserRepository interface {
	GetUserByID(id string) (*models.User, error)
	GetUserByEmail(email string) (*models.User, error)
	GetSuperAdminUser() (*models.User, error)
	GetUsersByCompanyID(companyID string) ([]models.User, error)
	CreateUser(user *models.User) (*models.User, error)
	UpdateUser(user *models.User) error
	DeleteUser(id string) error
	GetNotifications(userID string) ([]models.UserNotification, error)

	// SuperAdmin methods
	GetAllUsers(page, limit int, search string) ([]models.User, int64, error)
	GetAllUsersCount() (int64, error)
	GetActiveUsersCount() (int64, error)
	GetRecentSignupsCount(days int) (int64, error)
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

func (r *userRepository) GetSuperAdminUser() (*models.User, error) {
	var user models.User
	if err := r.db.Preload("Company").Preload("NotificationSettings").First(&user, "role = ?", string(models.RoleSuperAdmin)).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *userRepository) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.db.Preload("Company").Preload("NotificationSettings").First(&user, "email = ?", email).Error; err != nil {
		return nil, err
	}

	return &user, gorm.ErrRecordNotFound
}

func (r *userRepository) CreateUser(user *models.User) (*models.User, error) {
	if err := r.db.Create(user).Error; err != nil {
		return nil, err
	}

	// Preload the user
	if err := r.db.Preload("Company").Preload("NotificationSettings").First(user, "id = ?", user.ID).Error; err != nil {
		return nil, err
	}

	return user, nil
}

func (r *userRepository) UpdateUser(user *models.User) error {
	return r.db.Save(user).Error
}

func (r *userRepository) DeleteUser(id string) error {
	return r.db.Delete(&models.User{}, "id = ?", id).Error
}

func (r *userRepository) GetNotifications(userID string) ([]models.UserNotification, error) {
	var notifications []models.UserNotification
	if err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&notifications).Error; err != nil {
		return nil, err
	}

	return notifications, nil
}

// SuperAdmin methods implementation

func (r *userRepository) GetAllUsers(page, limit int, search string) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	query := r.db.Preload("Company").Preload("NotificationSettings")

	if search != "" {
		query = query.Where("first_name ILIKE ? OR last_name ILIKE ? OR email ILIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	// Get total count
	if err := query.Model(&models.User{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

func (r *userRepository) GetAllUsersCount() (int64, error) {
	var count int64
	if err := r.db.Model(&models.User{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *userRepository) GetActiveUsersCount() (int64, error) {
	var count int64
	// Consider users active if they've logged in within the last 30 days
	// This would require a last_login_at field in the User model
	// For now, return total user count as a placeholder
	if err := r.db.Model(&models.User{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *userRepository) GetRecentSignupsCount(days int) (int64, error) {
	var count int64
	intervalClause := fmt.Sprintf("created_at >= NOW() - INTERVAL '%d days'", days)
	if err := r.db.Model(&models.User{}).
		Where(intervalClause).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}
