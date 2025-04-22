package email

import (
	"bytes"
	"fmt"
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
}

// BaseEmailProvider implements common email functionality
type BaseEmailProvider struct {
	EmailProvider
}

// SendTemplatedEmail sends an email using a template
func (b *BaseEmailProvider) SendTemplatedEmail(to string, templatePath string, data interface{}) error {
	// Parse the base template
	basePath := filepath.Join("templates", "email", "base.html")
	baseTmpl, err := template.ParseFiles(basePath)
	if err != nil {
		return fmt.Errorf("failed to parse base email template: %v", err)
	}

	// Parse the content template
	contentTmpl, err := template.ParseFiles(templatePath)
	if err != nil {
		return fmt.Errorf("failed to parse content template: %v", err)
	}

	// Execute the content template first
	var contentBody bytes.Buffer
	if err := contentTmpl.Execute(&contentBody, data.(TemplateData).Data); err != nil {
		return fmt.Errorf("failed to execute content template: %v", err)
	}

	// Create a map for the base template data
	baseData := map[string]interface{}{
		"Content": contentBody.String(),
		"Year":    time.Now().Year(),
	}

	// Execute the base template with the content
	var finalBody bytes.Buffer
	if err := baseTmpl.Execute(&finalBody, baseData); err != nil {
		return fmt.Errorf("failed to execute base template: %v", err)
	}

	// Send the email
	return b.Send(to, data.(TemplateData).Subject, finalBody.String())
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
