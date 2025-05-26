package interfaces

// EmailSender defines the core email sending functionality
type EmailSender interface {
	Connect() error
	SendRaw(to, subject, body string) error
	Close() error
}

// EmailTemplateRenderer handles email template rendering
type EmailTemplateRenderer interface {
	RenderTemplate(templateName string, data interface{}) (string, error)
	RenderTemplateWithSubject(templateName string, data interface{}) (subject, body string, err error)
}

// EmailService provides high-level email operations
type EmailService interface {
	// Basic email operations
	SendEmail(to, subject, body string) error
	SendTemplatedEmail(to, templateName string, data interface{}) error

	// Specific email types
	SendInviteEmail(to, inviterName, acceptURL string) error
	SendUserCredentialsEmail(to, senderName, acceptURL, password string) error
	SendNotificationEmail(to, senderName, message string) error

	// Async operations
	SendEmailAsync(to, subject, body string) error
	SendTemplatedEmailAsync(to, subject, templateName string, data interface{}) error
}

// EmailConfig holds email configuration
type EmailConfig struct {
	Provider string
	Host     string
	Port     int
	Username string
	Password string
	From     string
}
