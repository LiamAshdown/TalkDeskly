package repositories

import (
	"log"

	"go.uber.org/dig"
	"gorm.io/gorm"
)

// RegisterRepositories registers all repositories in the DI container
func RegisterRepositories(container *dig.Container) {
	// Register repositories
	if err := container.Provide(func(db *gorm.DB) InboxRepository {
		return NewInboxRepository(db)
	}); err != nil {
		log.Fatalf("Failed to provide inbox repository: %v", err)
	}

	if err := container.Provide(func(db *gorm.DB) ContactRepository {
		return NewContactRepository(db)
	}); err != nil {
		log.Fatalf("Failed to provide contact repository: %v", err)
	}

	if err := container.Provide(func(db *gorm.DB) UserRepository {
		return NewUserRepository(db)
	}); err != nil {
		log.Fatalf("Failed to provide user repository: %v", err)
	}

	if err := container.Provide(func(db *gorm.DB) CompanyRepository {
		return NewCompanyRepository(db)
	}); err != nil {
		log.Fatalf("Failed to provide company repository: %v", err)
	}

	if err := container.Provide(func(db *gorm.DB) ConversationRepository {
		return NewConversationRepository(db)
	}); err != nil {
		log.Fatalf("Failed to provide conversation repository: %v", err)
	}

	if err := container.Provide(func(db *gorm.DB) CannedResponseRepository {
		return NewCannedResponseRepository(db)
	}); err != nil {
		log.Fatalf("Failed to provide canned response repository: %v", err)
	}

	if err := container.Provide(func(db *gorm.DB) NotificationRepository {
		return NewNotificationRepository(db)
	}); err != nil {
		log.Fatalf("Failed to provide notification repository: %v", err)
	}
}
