package repositories

import (
	"errors"
	"live-chat-server/models"

	"gorm.io/gorm"
)

type InboxRepository interface {
	GetInboxByID(id string) (*models.Inbox, error)
	GetInboxByIDAndCompanyID(id string, companyID string) (*models.Inbox, error)
	GetInboxesByCompanyID(companyID string) ([]models.Inbox, error)
	CreateInbox(inbox *models.Inbox) error
	CreateInboxWithWebChat(inbox *models.Inbox, webchat *models.InboxWebChat) error
	CreateInboxWithEmail(inbox *models.Inbox, email *models.InboxEmail) error
	UpdateInbox(inbox *models.Inbox, tx *gorm.DB) error
	UpdateWebChatConfig(webChat *models.InboxWebChat, tx *gorm.DB) error
	UpdateEmailConfig(email *models.InboxEmail, tx *gorm.DB) error
	DeleteInbox(id string) error
	DeleteInboxByIDAndCompanyID(id string, companyID string) error
	GetUsersForInbox(inboxID string) ([]models.User, error)
	GetInboxesForUser(userID string) ([]models.Inbox, error)
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

	// Load WebChat separately if this is a web chat inbox
	if inbox.Type == models.InboxTypeWebChat {
		var webChat models.InboxWebChat
		if err := r.db.Where("inbox_id = ?", inbox.ID).First(&webChat).Error; err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, err
			}
		} else {
			inbox.WebChat = &webChat
		}
	} else if inbox.Type == models.InboxTypeEmail {
		var email models.InboxEmail
		if err := r.db.Where("inbox_id = ?", inbox.ID).First(&email).Error; err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, err
			}
		} else {
			inbox.Email = &email
		}
	}

	return &inbox, nil
}

func (r *inboxRepository) GetInboxByIDAndCompanyID(id string, companyID string) (*models.Inbox, error) {
	var inbox models.Inbox
	if err := r.db.Preload("Users").First(&inbox, "id = ? AND company_id = ?", id, companyID).Error; err != nil {
		return nil, err
	}

	// Load WebChat separately if this is a web chat inbox
	if inbox.Type == models.InboxTypeWebChat {
		var webChat models.InboxWebChat
		if err := r.db.Where("inbox_id = ?", inbox.ID).First(&webChat).Error; err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, err
			}
		} else {
			inbox.WebChat = &webChat
		}
	} else if inbox.Type == models.InboxTypeEmail {
		var email models.InboxEmail
		if err := r.db.Where("inbox_id = ?", inbox.ID).First(&email).Error; err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, err
			}
		} else {
			inbox.Email = &email
		}
	}

	return &inbox, nil
}

func (r *inboxRepository) GetInboxesByCompanyID(companyID string) ([]models.Inbox, error) {
	var inboxes []models.Inbox
	if err := r.db.Preload("Users").Where("company_id = ?", companyID).Where("deleted_at IS NULL").Find(&inboxes).Error; err != nil {
		return nil, err
	}

	// For each inbox, load the type-specific data
	for i := range inboxes {
		if inboxes[i].Type == models.InboxTypeWebChat {
			var webChat models.InboxWebChat
			if err := r.db.Where("inbox_id = ?", inboxes[i].ID).First(&webChat).Error; err != nil {
				if !errors.Is(err, gorm.ErrRecordNotFound) {
					return nil, err
				}
			} else {
				inboxes[i].WebChat = &webChat
			}
		} else if inboxes[i].Type == models.InboxTypeEmail {
			var email models.InboxEmail
			if err := r.db.Where("inbox_id = ?", inboxes[i].ID).First(&email).Error; err != nil {
				if !errors.Is(err, gorm.ErrRecordNotFound) {
					return nil, err
				}
			} else {
				inboxes[i].Email = &email
			}
		}
	}

	return inboxes, nil
}

func (r *inboxRepository) CreateInbox(inbox *models.Inbox) error {
	return r.db.Create(inbox).Error
}

func (r *inboxRepository) CreateInboxWithWebChat(inbox *models.Inbox, webchat *models.InboxWebChat) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Create the main inbox first
		if err := tx.Create(inbox).Error; err != nil {
			return err
		}

		// Set the inbox ID on the webchat config
		webchat.InboxID = inbox.ID

		// Create the webchat configuration
		return tx.Create(webchat).Error
	})
}

func (r *inboxRepository) CreateInboxWithEmail(inbox *models.Inbox, email *models.InboxEmail) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Create the main inbox first
		if err := tx.Create(inbox).Error; err != nil {
			return err
		}

		// Set the inbox ID on the email config
		email.InboxID = inbox.ID

		// Create the email configuration
		return tx.Create(email).Error
	})
}

func (r *inboxRepository) UpdateInbox(inbox *models.Inbox, tx *gorm.DB) error {
	return tx.Save(inbox).Error
}

func (r *inboxRepository) UpdateWebChatConfig(webChat *models.InboxWebChat, tx *gorm.DB) error {
	if webChat.ID == "" {
		return tx.Create(webChat).Error
	}
	return tx.Save(webChat).Error
}

func (r *inboxRepository) UpdateEmailConfig(email *models.InboxEmail, tx *gorm.DB) error {
	if email.ID == "" {
		return tx.Create(email).Error
	}
	return tx.Save(email).Error
}

func (r *inboxRepository) DeleteInbox(id string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var inbox models.Inbox
		if err := tx.First(&inbox, "id = ?", id).Error; err != nil {
			return err
		}

		return tx.Delete(&models.Inbox{}, "id = ?", id).Error
	})
}

func (r *inboxRepository) DeleteInboxByIDAndCompanyID(id string, companyID string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var inbox models.Inbox
		if err := tx.First(&inbox, "id = ? AND company_id = ?", id, companyID).Error; err != nil {
			return err
		}

		return tx.Delete(&models.Inbox{}, "id = ? AND company_id = ?", id, companyID).Error
	})
}

func (r *inboxRepository) GetInboxesForUser(userID string) ([]models.Inbox, error) {
	var inboxes []models.Inbox

	// Query inboxes that are associated with the user through the inbox_users join table
	err := r.db.Joins("JOIN inbox_users ON inbox_users.inbox_id = inboxes.id").
		Where("inbox_users.user_id = ?", userID).
		Find(&inboxes).Error

	return inboxes, err
}
