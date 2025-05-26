package email

import (
	"fmt"
	"live-chat-server/interfaces"

	"github.com/go-gomail/gomail"
)

// SMTPSender implements the EmailSender interface using SMTP
type SMTPSender struct {
	config interfaces.EmailConfig
	dialer *gomail.Dialer
	logger interfaces.Logger
}

// NewSMTPSender creates a new SMTP email sender
func NewSMTPSender(config interfaces.EmailConfig, logger interfaces.Logger) interfaces.EmailSender {
	return &SMTPSender{
		config: config,
		logger: logger,
	}
}

// Connect establishes connection to the SMTP server
func (s *SMTPSender) Connect() error {
	s.dialer = gomail.NewDialer(s.config.Host, s.config.Port, s.config.Username, s.config.Password)

	// Test the connection
	closer, err := s.dialer.Dial()
	if err != nil {
		s.logger.Error("Failed to connect to SMTP server: %v", err)
		return fmt.Errorf("failed to connect to SMTP server: %w", err)
	}

	// Close the test connection
	if err := closer.Close(); err != nil {
		s.logger.Warn("Failed to close test connection: %v", err)
	}

	s.logger.Info("Successfully connected to SMTP server at %s:%d", s.config.Host, s.config.Port)
	return nil
}

// SendRaw sends a raw email with the given parameters
func (s *SMTPSender) SendRaw(to, subject, body string) error {
	if s.dialer == nil {
		return fmt.Errorf("SMTP connection not established, call Connect() first")
	}

	msg := gomail.NewMessage()
	msg.SetHeader("From", s.config.From)
	msg.SetHeader("To", to)
	msg.SetHeader("Subject", subject)
	msg.SetBody("text/html", body)

	if err := s.dialer.DialAndSend(msg); err != nil {
		s.logger.Error("Failed to send email to %s: %v", to, err)
		return fmt.Errorf("failed to send email: %w", err)
	}

	s.logger.Info("Successfully sent email to %s with subject: %s", to, subject)
	return nil
}

// Close closes the SMTP connection (no-op for gomail as it manages connections internally)
func (s *SMTPSender) Close() error {
	s.logger.Info("SMTP sender closed")
	return nil
}
