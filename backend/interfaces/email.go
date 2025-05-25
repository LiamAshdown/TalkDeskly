package interfaces

type EmailProvider interface {
	Connect() error
	Send(to string, subject string, body string) error
	SendTemplatedEmail(to string, templatePath string, data interface{}) error
	SendInviteEmail(to, inviterName, acceptURL string) error
	SendWelcomeEmail(to, name, companyName, actionURL string) error
	SendUserCredentialsEmail(to, senderName, acceptURL, password string) error
	SendNotificationEmail(to, senderName, message string) error
	SendTemplatedEmailAsJob(to, subject, templateName string, data interface{}) error
}

type EmailProviderFactory interface {
	NewEmailProvider() EmailProvider
}

type BaseEmailProvider struct {
	EmailProvider
}
