package email

import (
	"fmt"
	"live-chat-server/config"
	"live-chat-server/interfaces"
	"time"
)

// EmailServiceImpl implements the EmailService interface
type EmailServiceImpl struct {
	sender    interfaces.EmailSender
	renderer  interfaces.EmailTemplateRenderer
	jobClient interfaces.JobClient
	logger    interfaces.Logger
	config    config.Config
}

// NewEmailService creates a new email service
func NewEmailService(
	sender interfaces.EmailSender,
	renderer interfaces.EmailTemplateRenderer,
	jobClient interfaces.JobClient,
	logger interfaces.Logger,
) interfaces.EmailService {
	return &EmailServiceImpl{
		sender:    sender,
		renderer:  renderer,
		jobClient: jobClient,
		logger:    logger,
	}
}

// SendEmail sends a basic email
func (e *EmailServiceImpl) SendEmail(to, subject, body string) error {
	return e.sender.SendRaw(to, subject, body)
}

// SendTemplatedEmail sends an email using a template
func (e *EmailServiceImpl) SendTemplatedEmail(to, templateName string, data interface{}) error {
	// Convert raw data to TemplateData if needed
	var templateData TemplateData
	switch v := data.(type) {
	case TemplateData:
		templateData = v
	case map[string]interface{}:
		templateData = NewTemplateData()
		templateData.Data = v
		// Set a default subject based on template name if not provided
		if subject, exists := v["subject"].(string); exists {
			templateData.Subject = subject
		} else {
			templateData.Subject = fmt.Sprintf("%s Notification", e.config.ApplicationName)
		}
	default:
		return fmt.Errorf("unsupported data type for template: %T", data)
	}

	subject, body, err := e.renderer.RenderTemplateWithSubject(templateName, templateData)
	if err != nil {
		e.logger.Error("Failed to render template %s: %v", templateName, err)
		return fmt.Errorf("failed to render template: %w", err)
	}

	return e.sender.SendRaw(to, subject, body)
}

// SendInviteEmail sends an invite email
func (e *EmailServiceImpl) SendInviteEmail(to, inviterName, acceptURL string) error {
	templateName := "invite.html"
	data := NewInviteTemplateData(inviterName, acceptURL)
	return e.SendTemplatedEmail(to, templateName, data)
}

// SendUserCredentialsEmail sends user credentials email
func (e *EmailServiceImpl) SendUserCredentialsEmail(to, senderName, acceptURL, password string) error {
	templateName := "user_create_credentials.html"
	data := NewUserCredentialsTemplateData(to, senderName, acceptURL, password)
	return e.SendTemplatedEmail(to, templateName, data)
}

// SendNotificationEmail sends a notification email
func (e *EmailServiceImpl) SendNotificationEmail(to, senderName, message string) error {
	templateName := "notifications.html"
	data := NewNotificationTemplateData(senderName, message)
	return e.SendTemplatedEmail(to, templateName, data)
}

// SendEmailAsync sends an email asynchronously using the job queue
func (e *EmailServiceImpl) SendEmailAsync(to, subject, body string) error {
	return e.jobClient.Enqueue("send_email", map[string]interface{}{
		"to":      to,
		"subject": subject,
		"body":    body,
	})
}

// SendTemplatedEmailAsync sends a templated email asynchronously
func (e *EmailServiceImpl) SendTemplatedEmailAsync(to, subject, templateName string, data interface{}) error {
	// Convert raw data to TemplateData if needed
	var templateData TemplateData
	switch v := data.(type) {
	case TemplateData:
		templateData = v
	case map[string]interface{}:
		templateData = NewTemplateData()
		templateData.Data = v
		templateData.Subject = subject
		templateData.AppName = e.config.ApplicationName
	default:
		return fmt.Errorf("unsupported data type for template: %T", data)
	}

	subject, body, err := e.renderer.RenderTemplateWithSubject(templateName, templateData)
	if err != nil {
		e.logger.Error("Failed to render template %s for async email: %v", templateName, err)
		return fmt.Errorf("failed to render template: %w", err)
	}

	return e.SendEmailAsync(to, subject, body)
}

// Helper function to create template data with custom subject
func (e *EmailServiceImpl) CreateTemplateData(subject string, data map[string]interface{}) TemplateData {
	templateData := NewTemplateData()
	templateData.Subject = subject
	templateData.Data = data
	return templateData
}

// TemplateData represents the data structure for email templates
type TemplateData struct {
	AppName        string                 `json:"app_name"`
	Subject        string                 `json:"subject"`
	CurrentYear    int                    `json:"current_year"`
	UnsubscribeURL string                 `json:"unsubscribe_url"`
	Data           map[string]interface{} `json:"data"`
}

// NewTemplateData creates a new TemplateData with default values
func NewTemplateData() TemplateData {
	return TemplateData{
		AppName:        "TalkDeskly",
		Subject:        "TalkDeskly",
		CurrentYear:    time.Now().Year(),
		UnsubscribeURL: "https://talkdeskly.com/unsubscribe",
		Data:           make(map[string]interface{}),
	}
}

// NewInviteTemplateData creates template data for invite emails
func NewInviteTemplateData(inviterName, acceptURL string) TemplateData {
	data := NewTemplateData()
	data.Subject = "Invitation to join TalkDeskly"
	data.Data["InviterName"] = inviterName
	data.Data["AcceptURL"] = acceptURL
	return data
}

// NewWelcomeTemplateData creates template data for welcome emails
func NewWelcomeTemplateData(name, companyName, actionURL string) TemplateData {
	data := NewTemplateData()
	data.Subject = "Welcome to TalkDeskly"
	data.Data["Name"] = name
	data.Data["CompanyName"] = companyName
	data.Data["ActionURL"] = actionURL
	return data
}

// NewUserCredentialsTemplateData creates template data for user credentials emails
func NewUserCredentialsTemplateData(email, inviterName, acceptURL, password string) TemplateData {
	data := NewTemplateData()
	data.Subject = "TalkDeskly User Credentials"
	data.Data["Email"] = email
	data.Data["InviterName"] = inviterName
	data.Data["AcceptURL"] = acceptURL
	data.Data["Password"] = password
	return data
}

// NewNotificationTemplateData creates template data for notification emails
func NewNotificationTemplateData(senderName, message string) TemplateData {
	data := NewTemplateData()
	data.Subject = "New Notification"
	data.Data["UserName"] = senderName
	data.Data["MessageContent"] = message
	return data
}
