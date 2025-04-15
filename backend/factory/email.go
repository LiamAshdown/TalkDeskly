package factory

import (
	"fmt"
	"live-chat-server/config"
	"live-chat-server/email"
	"strconv"
)

// NewEmailProvider creates a new email provider based on the application configuration
func NewEmailProvider() email.EmailProvider {
	providerType := config.App.EmailProvider

	var provider email.EmailProvider

	switch providerType {
	case "gomail":
		port, err := strconv.Atoi(config.App.EmailPort)
		if err != nil {
			panic(fmt.Errorf("failed to convert email port to int: %v", err))
		}

		gomailProvider := &email.GoMailProvider{
			Host:     config.App.EmailHost,
			Port:     port,
			Username: config.App.EmailUsername,
			Password: config.App.EmailPassword,
			From:     config.App.EmailFrom,
		}
		gomailProvider.BaseEmailProvider = email.BaseEmailProvider{EmailProvider: gomailProvider}
		provider = gomailProvider
	default:
		panic(fmt.Errorf("invalid email provider: %s", providerType))
	}

	if err := provider.Connect(); err != nil {
		panic(fmt.Errorf("failed to connect to email provider %s: %v", providerType, err))
	}

	return provider
}
