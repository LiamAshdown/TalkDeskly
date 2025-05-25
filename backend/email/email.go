package email

import (
	"bytes"
	"live-chat-server/interfaces"
	"path/filepath"
	"text/template"
	"time"
)

// TemplateData represents the data that can be used in email templates
type TemplateData struct {
	Subject        string
	CurrentYear    int
	UnsubscribeURL string
	Data           map[string]interface{}
}

// EmailProvider interface defines the methods for sending emails
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

// BaseEmailProvider implements common email functionality
type BaseEmailProvider struct {
	EmailProvider
	logger    interfaces.Logger
	jobClient interfaces.JobClient
}

// NewBaseEmailProvider creates a new BaseEmailProvider
func NewBaseEmailProvider(provider EmailProvider, logger interfaces.Logger, jobClient interfaces.JobClient) BaseEmailProvider {
	return BaseEmailProvider{
		EmailProvider: provider,
		logger:        logger,
		jobClient:     jobClient,
	}
}

// SendTemplatedEmail sends an email using a template
func (b *BaseEmailProvider) SendTemplatedEmail(to string, templatePath string, data interface{}) error {
	// Parse the base template
	basePath := filepath.Join("templates", "email", "base.html")
	baseTmpl, err := template.ParseFiles(basePath)
	if err != nil {
		b.logger.Error("failed to parse base email template: %v", err)
		return err
	}

	// Parse the content template
	contentTmpl, err := template.ParseFiles(templatePath)
	if err != nil {
		b.logger.Error("failed to parse content template: %v", err)
		return err
	}

	// Execute the content template first
	var contentBody bytes.Buffer
	if err := contentTmpl.Execute(&contentBody, data.(TemplateData).Data); err != nil {
		b.logger.Error("failed to execute content template: %v", err)
		return err
	}

	// Create a map for the base template data
	baseData := map[string]interface{}{
		"Content": contentBody.String(),
		"Year":    time.Now().Year(),
	}

	// Execute the base template with the content
	var finalBody bytes.Buffer
	if err := baseTmpl.Execute(&finalBody, baseData); err != nil {
		b.logger.Error("failed to execute base template: %v", err)
		return err
	}

	// Send the email
	return b.Send(to, data.(TemplateData).Subject, finalBody.String())
}

func (b *BaseEmailProvider) GetTemplateContent(templatePath string, data interface{}) (string, error) {
	// Parse the base template
	basePath := filepath.Join("templates", "email", "base.html")
	baseTmpl, err := template.ParseFiles(basePath)
	if err != nil {
		b.logger.Error("failed to parse base email template: %v", err)
		return "", err
	}

	// Parse the content template
	contentTmpl, err := template.ParseFiles(templatePath)
	if err != nil {
		b.logger.Error("failed to parse content template: %v", err)
		return "", err
	}

	// Execute the content template first
	var contentBody bytes.Buffer
	if err := contentTmpl.Execute(&contentBody, data.(TemplateData).Data); err != nil {
		b.logger.Error("failed to execute content template: %v", err)
		return "", err
	}

	// Create a map for the base template data
	baseData := map[string]interface{}{
		"Content": contentBody.String(),
		"Year":    time.Now().Year(),
	}

	// Execute the base template with the content
	var finalBody bytes.Buffer
	if err := baseTmpl.Execute(&finalBody, baseData); err != nil {
		b.logger.Error("failed to execute base template: %v", err)
		return "", err
	}

	return finalBody.String(), nil
}

// SendInviteEmail sends an invite email
func (b *BaseEmailProvider) SendInviteEmail(to, inviterName, acceptURL string) error {
	templatePath := filepath.Join("templates", "email", "invite.html")
	data := NewInviteTemplateData(inviterName, acceptURL)
	return b.SendTemplatedEmail(to, templatePath, data)
}

// SendWelcomeEmail sends a welcome email
func (b *BaseEmailProvider) SendWelcomeEmail(to, name, companyName, actionURL string) error {
	templatePath := filepath.Join("templates", "email", "welcome.html")
	data := NewWelcomeTemplateData(name, companyName, actionURL)
	return b.SendTemplatedEmail(to, templatePath, data)
}

func (b *BaseEmailProvider) SendUserCredentialsEmail(to, senderName, acceptURL, password string) error {
	templatePath := filepath.Join("templates", "email", "user_create_credentials.html")
	data := NewUserCredentialsTemplateData(to, senderName, acceptURL, password)
	return b.SendTemplatedEmail(to, templatePath, data)
}

func (b *BaseEmailProvider) SendNotificationEmail(to, senderName, message string) error {
	templatePath := filepath.Join("templates", "email", "notifications.html")
	data := NewNotificationTemplateData(senderName, message)
	return b.SendTemplatedEmail(to, templatePath, data)
}

func (b *BaseEmailProvider) SendTemplatedEmailAsJob(to, subject, templateName string, data interface{}) error {
	fullTemplatePath := filepath.Join("templates", "email", templateName)

	templateData := DefaultTemplateData()
	templateData.Data = data.(map[string]interface{})
	templateData.Subject = subject

	content, err := b.GetTemplateContent(fullTemplatePath, templateData)
	if err != nil {
		return err
	}

	err = b.jobClient.Enqueue("send_email", map[string]interface{}{
		"to":      to,
		"subject": templateData.Subject,
		"body":    content,
	})

	if err != nil {
		return err
	}

	return nil
}

// DefaultTemplateData returns a TemplateData struct with default values
func DefaultTemplateData() TemplateData {
	return TemplateData{
		Subject:        "TalkDeskly",
		CurrentYear:    time.Now().Year(),
		UnsubscribeURL: "https://talkdeskly.com/unsubscribe",
		Data:           make(map[string]interface{}),
	}
}

// NewInviteTemplateData creates template data for invite emails
func NewInviteTemplateData(inviterName, acceptURL string) TemplateData {
	data := DefaultTemplateData()
	data.Subject = "Invitation to join TalkDeskly"
	data.Data["InviterName"] = inviterName
	data.Data["AcceptURL"] = acceptURL
	return data
}

// NewWelcomeTemplateData creates template data for welcome emails
func NewWelcomeTemplateData(name string, companyName string, actionURL string) TemplateData {
	data := DefaultTemplateData()
	data.Subject = "Welcome to TalkDeskly"
	data.Data["Name"] = name
	data.Data["CompanyName"] = companyName
	data.Data["ActionURL"] = actionURL
	return data
}

// NewUserCredentialsTemplateData creates template data for user credentials emails
func NewUserCredentialsTemplateData(email string, inviterName string, acceptURL string, password string) TemplateData {
	data := DefaultTemplateData()
	data.Subject = "TalkDeskly User Credentials"
	data.Data["Email"] = email
	data.Data["InviterName"] = inviterName
	data.Data["AcceptURL"] = acceptURL
	data.Data["Password"] = password
	return data
}

func NewNotificationTemplateData(senderName, message string) TemplateData {
	data := DefaultTemplateData()
	data.Subject = "New Notification"
	data.Data["UserName"] = senderName
	data.Data["MessageContent"] = message
	return data
}
