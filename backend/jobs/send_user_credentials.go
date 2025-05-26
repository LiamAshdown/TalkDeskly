package jobs

import (
	"context"
	"encoding/json"
	"fmt"
	"live-chat-server/interfaces"

	"github.com/hibiken/asynq"
)

// SendUserCredentialsJobPayload defines the payload for the send user credentials job
type SendUserCredentialsJobPayload struct {
	Email       string `json:"email"`
	InviterName string `json:"inviter_name"`
	AcceptURL   string `json:"accept_url"`
	Password    string `json:"password"`
}

// SendUserCredentialsJob handles sending user credentials emails
type SendUserCredentialsJob struct {
	*BaseJob
	emailService interfaces.EmailService
	logger       interfaces.Logger
}

// NewSendUserCredentialsJob creates a new send user credentials job
func NewSendUserCredentialsJob(emailService interfaces.EmailService, logger interfaces.Logger) *SendUserCredentialsJob {
	return &SendUserCredentialsJob{
		BaseJob:      NewBaseJob("send_user_credentials"),
		emailService: emailService,
		logger:       logger,
	}
}

// ProcessTask processes the send user credentials task
func (j *SendUserCredentialsJob) ProcessTask(ctx context.Context, task *asynq.Task) error {
	var payload SendUserCredentialsJobPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return fmt.Errorf("failed to unmarshal payload: %v", err)
	}

	if err := j.emailService.SendUserCredentialsEmail(payload.Email, payload.InviterName, payload.AcceptURL, payload.Password); err != nil {
		return fmt.Errorf("failed to send user credentials email: %v", err)
	}

	j.logger.Info("Successfully sent user credentials email to %s", payload.Email)

	return nil
}
