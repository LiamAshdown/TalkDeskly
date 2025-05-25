package jobs

import (
	"context"
	"encoding/json"
	"live-chat-server/interfaces"

	"github.com/hibiken/asynq"
)

type EmailJobPayload struct {
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Body    string `json:"body"`
}

type EmailJob struct {
	*BaseJob
	emailProvider interfaces.EmailProvider
	logger        interfaces.Logger
}

func NewSendEmailJob(emailProvider interfaces.EmailProvider, logger interfaces.Logger) *EmailJob {
	return &EmailJob{
		BaseJob:       NewBaseJob("email"),
		emailProvider: emailProvider,
		logger:        logger,
	}
}

func (j *EmailJob) ProcessTask(ctx context.Context, task *asynq.Task) error {
	var payload EmailJobPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		j.logger.Error("failed to unmarshal email job payload: %v", err)
		return err
	}

	return j.emailProvider.Send(payload.Email, payload.Subject, payload.Body)
}

func (j *EmailJob) CreateSendEmailTask(email, subject, body string) (*asynq.Task, error) {
	payload := EmailJobPayload{
		Email:   email,
		Subject: subject,
		Body:    body,
	}
	return j.CreateTask(payload)
}
