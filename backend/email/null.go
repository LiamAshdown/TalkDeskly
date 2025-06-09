package email

import (
	"live-chat-server/interfaces"
)

// NullSender implements the EmailSender interface using SMTP
type NullSender struct {
	config interfaces.EmailConfig
	logger interfaces.Logger
}

// NewSMTPSender creates a new SMTP email sender
func NewNullSender(config interfaces.EmailConfig, logger interfaces.Logger) interfaces.EmailSender {
	return &NullSender{
		config: config,
		logger: logger,
	}
}

// Connect establishes connection to the SMTP server
func (s *NullSender) Connect() error {
	s.logger.Info("Null sender connected")
	return nil
}

// SendRaw sends a raw email with the given parameters
func (s *NullSender) SendRaw(to, subject, body string) error {
	s.logger.Info("Successfully sent email to %s with subject: %s", to, subject)
	return nil
}

// Close closes the SMTP connection (no-op for gomail as it manages connections internally)
func (s *NullSender) Close() error {
	s.logger.Info("SMTP sender closed")
	return nil
}
