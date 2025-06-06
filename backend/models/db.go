package models

import (
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase(dsn string) {
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err)
	}

	err = DB.AutoMigrate(
		&Company{},
		&User{},
		&Inbox{},
		&InboxEmail{},
		&InboxWebChat{},
		&Contact{},
		&NotificationSettings{},
		&Conversation{},
		&Message{},
		&ContactNote{},
		&CompanyInvite{},
		&CannedResponse{},
		&UserNotification{},
		&AuditLog{},
	)
	if err != nil {
		panic(err)
	}
}

func RunMigrations() {
	err := DB.AutoMigrate(
		&User{},
		&Company{},
		&Conversation{},
		&Contact{},
		&Inbox{},
		&Message{},
		&CannedResponse{},
		&NotificationSettings{},
		&UserNotification{},
		&ContactNote{},
		&AuditLog{},
	)

	if err != nil {
		panic(err)
	}
}
