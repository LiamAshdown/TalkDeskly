package email

import (
	"fmt"
	"live-chat-server/config"
	"live-chat-server/interfaces"
	"strconv"
)

// EmailFactory creates email-related components
type EmailFactory struct {
	logger    interfaces.Logger
	jobClient interfaces.JobClient
}

// NewEmailFactory creates a new email factory
func NewEmailFactory(logger interfaces.Logger, jobClient interfaces.JobClient) *EmailFactory {
	return &EmailFactory{
		logger:    logger,
		jobClient: jobClient,
	}
}

// CreateEmailSender creates an email sender based on the configuration
func (f *EmailFactory) CreateEmailSender(config interfaces.EmailConfig) (interfaces.EmailSender, error) {
	switch config.Provider {
	case "smtp", "gomail":
		return NewSMTPSender(config, f.logger), nil
	default:
		return nil, fmt.Errorf("unsupported email provider: %s", config.Provider)
	}
}

// CreateTemplateRenderer creates a template renderer
func (f *EmailFactory) CreateTemplateRenderer() interfaces.EmailTemplateRenderer {
	return NewTemplateRenderer(f.logger)
}

// CreateEmailService creates a complete email service
func (f *EmailFactory) CreateEmailService(emailConfig interfaces.EmailConfig, config config.ConfigManager) (interfaces.EmailService, error) {
	sender, err := f.CreateEmailSender(emailConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create email sender: %w", err)
	}

	// Connect the sender
	if err := sender.Connect(); err != nil {
		return nil, fmt.Errorf("failed to connect email sender: %w", err)
	}

	renderer := f.CreateTemplateRenderer()

	return NewEmailService(sender, renderer, f.jobClient, f.logger, emailConfig, config), nil
}

// CreateEmailConfigFromEnv creates email configuration from environment/config
func CreateEmailConfigFromEnv(provider, host, portStr, username, password, from string) (interfaces.EmailConfig, error) {
	port, err := strconv.Atoi(portStr)
	if err != nil {
		return interfaces.EmailConfig{}, fmt.Errorf("invalid email port: %w", err)
	}

	return interfaces.EmailConfig{
		Provider: provider,
		Host:     host,
		Port:     port,
		Username: username,
		Password: password,
		From:     from,
	}, nil
}
