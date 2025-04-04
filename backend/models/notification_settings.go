package models

import "time"

type NotificationSettings struct {
	ID              string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID          string    `json:"user_id" gorm:"type:uuid;uniqueIndex;not null"`
	NewConversation bool      `json:"new_conversation" gorm:"default:true"`
	NewMessage      bool      `json:"new_message" gorm:"default:true"`
	Mentions        bool      `json:"mentions" gorm:"default:true"`
	EmailEnabled    bool      `json:"email_enabled" gorm:"default:true"`
	BrowserEnabled  bool      `json:"browser_enabled" gorm:"default:false"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	User            User      `json:"-" gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}
