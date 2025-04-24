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

	err = DB.AutoMigrate(&Company{}, &User{}, &Inbox{}, &Contact{}, &NotificationSettings{}, &Conversation{}, &Message{}, &ContactNote{}, &CompanyInvite{}, &CannedResponse{})
	if err != nil {
		panic(err)
	}
}
