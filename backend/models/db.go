package models

import (
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase(dsn string) {
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Error connecting to database: ", err)
	}

	err = DB.AutoMigrate(&Company{}, &User{}, &Inbox{}, &Contact{}, &NotificationSettings{}, &Conversation{}, &Message{}, &ContactNote{})
	if err != nil {
		log.Fatal("Auto migration failed: ", err)
	}
}
