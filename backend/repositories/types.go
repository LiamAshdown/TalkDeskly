package repositories

import "live-chat-server/models"

type InboxRepository interface {
	GetInboxByID(id string) (*models.Inbox, error)
	GetInboxByIDAndCompanyID(id string, companyID string) (*models.Inbox, error)
	GetInboxesByCompanyID(companyID string) ([]models.Inbox, error)
	CreateInbox(inbox *models.Inbox) error
	UpdateInbox(inbox *models.Inbox) error
	DeleteInbox(id string) error
	DeleteInboxByIDAndCompanyID(id string, companyID string) error
}
