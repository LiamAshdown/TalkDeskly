package jobs

import (
	"context"
	"encoding/json"
	"live-chat-server/interfaces"

	"github.com/hibiken/asynq"
)

type EmailJobPayload struct {
	To      string `json:"to"`
	Subject string `json:"subject"`
	Body    string `json:"body"`
}

type EmailJob struct {
	*BaseJob
	emailService interfaces.EmailService
	logger       interfaces.Logger
}

func NewSendEmailJob(emailService interfaces.EmailService, logger interfaces.Logger) *EmailJob {
	return &EmailJob{
		BaseJob:      NewBaseJob("email"),
		emailService: emailService,
		logger:       logger,
	}
}

func (j *EmailJob) ProcessTask(ctx context.Context, task *asynq.Task) error {
	var payload EmailJobPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		j.logger.Error("failed to unmarshal email job payload: %v", err)
		return err
	}

	return j.emailService.SendEmail(payload.To, payload.Subject, payload.Body)
}

func (j *EmailJob) CreateSendEmailTask(to, subject, body string) (*asynq.Task, error) {
	payload := EmailJobPayload{
		To:      to,
		Subject: subject,
		Body:    body,
	}
	return j.CreateTask(payload)
}
