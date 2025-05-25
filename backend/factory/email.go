package factory

import (
	"fmt"
	"live-chat-server/config"
	"live-chat-server/email"
	"live-chat-server/interfaces"
	"strconv"
)

type EmailProviderFactoryImpl struct {
	jobClient interfaces.JobClient
	logger    interfaces.Logger
}

func NewEmailProviderFactory(jobClient interfaces.JobClient, logger interfaces.Logger) interfaces.EmailProviderFactory {
	return &EmailProviderFactoryImpl{
		jobClient: jobClient,
		logger:    logger,
	}
}

func (f *EmailProviderFactoryImpl) NewEmailProvider() interfaces.EmailProvider {
	providerType := config.App.EmailProvider

	var provider interfaces.EmailProvider

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
		gomailProvider.BaseEmailProvider = email.NewBaseEmailProvider(gomailProvider, f.logger, f.jobClient)
		provider = gomailProvider
	default:
		panic(fmt.Errorf("invalid email provider: %s", providerType))
	}

	if err := provider.Connect(); err != nil {
		panic(fmt.Errorf("failed to connect to email provider %s: %v", providerType, err))
	}

	return provider
}
