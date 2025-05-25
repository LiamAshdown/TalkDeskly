package jobs

import (
	"context"
	"encoding/json"
	"fmt"
	"live-chat-server/interfaces"

	"github.com/hibiken/asynq"
)

type SendWelcomeJobPayload struct {
	Email       string `json:"email"`
	Name        string `json:"name"`
	CompanyName string `json:"company_name"`
	ActionURL   string `json:"action_url"`
}

type SendWelcomeJob struct {
	*BaseJob
	emailProvider interfaces.EmailProvider
}

func NewSendWelcomeJob(emailProvider interfaces.EmailProvider) *SendWelcomeJob {
	return &SendWelcomeJob{
		BaseJob:       NewBaseJob("send_welcome"),
		emailProvider: emailProvider,
	}
}

func (j *SendWelcomeJob) ProcessTask(ctx context.Context, task *asynq.Task) error {
	var payload SendWelcomeJobPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return fmt.Errorf("failed to unmarshal payload: %w", err)
	}

	if err := j.emailProvider.SendWelcomeEmail(payload.Email, payload.Name, payload.CompanyName, payload.ActionURL); err != nil {
		return fmt.Errorf("failed to send welcome email: %w", err)
	}

	return nil
}

func (j *SendWelcomeJob) CreateSendWelcomeTask(email, name, companyName, actionURL string) (*asynq.Task, error) {
	payload := SendWelcomeJobPayload{
		Email:       email,
		Name:        name,
		CompanyName: companyName,
		ActionURL:   actionURL,
	}
	return j.CreateTask(payload)
}
