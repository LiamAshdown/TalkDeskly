package email

import (
	"bytes"
	"fmt"
	"live-chat-server/interfaces"
	"path/filepath"
	"text/template"
)

// TemplateRenderer implements email template rendering
type TemplateRenderer struct {
	logger interfaces.Logger
}

// NewTemplateRenderer creates a new template renderer
func NewTemplateRenderer(logger interfaces.Logger) interfaces.EmailTemplateRenderer {
	return &TemplateRenderer{
		logger: logger,
	}
}

// RenderTemplate renders a template with the given data and returns the body
func (r *TemplateRenderer) RenderTemplate(templateName string, data interface{}) (string, error) {
	templateData, ok := data.(TemplateData)
	if !ok {
		return "", fmt.Errorf("invalid template data type, expected TemplateData")
	}

	// Parse the base template
	basePath := filepath.Join("templates", "email", "base.html")
	baseTmpl, err := template.ParseFiles(basePath)
	if err != nil {
		r.logger.Error("failed to parse base email template: %v", err)
		return "", fmt.Errorf("failed to parse base template: %w", err)
	}

	// Parse the content template
	contentPath := filepath.Join("templates", "email", templateName)
	contentTmpl, err := template.ParseFiles(contentPath)
	if err != nil {
		r.logger.Error("failed to parse content template %s: %v", templateName, err)
		return "", fmt.Errorf("failed to parse content template: %w", err)
	}

	// Execute the content template first
	var contentBody bytes.Buffer
	if err := contentTmpl.Execute(&contentBody, templateData.Data); err != nil {
		r.logger.Error("failed to execute content template %s: %v", templateName, err)
		return "", fmt.Errorf("failed to execute content template: %w", err)
	}

	// Create data for the base template
	baseData := map[string]interface{}{
		"Content": contentBody.String(),
		"Year":    templateData.CurrentYear,
	}

	// Execute the base template with the content
	var finalBody bytes.Buffer
	if err := baseTmpl.Execute(&finalBody, baseData); err != nil {
		r.logger.Error("failed to execute base template: %v", err)
		return "", fmt.Errorf("failed to execute base template: %w", err)
	}

	return finalBody.String(), nil
}

// RenderTemplateWithSubject renders a template and returns both subject and body
func (r *TemplateRenderer) RenderTemplateWithSubject(templateName string, data interface{}) (subject, body string, err error) {
	templateData, ok := data.(TemplateData)
	if !ok {
		return "", "", fmt.Errorf("invalid template data type, expected TemplateData")
	}

	body, err = r.RenderTemplate(templateName, data)
	if err != nil {
		return "", "", err
	}

	return templateData.Subject, body, nil
}
