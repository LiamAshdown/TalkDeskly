package jobs

import (
	"context"
	"encoding/json"
	"fmt"
	"live-chat-server/email"
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
	emailProvider email.EmailProvider
	logger        interfaces.Logger
}

// NewSendInviteJob creates a new send invite job
func NewSendUserCredentialsJob(emailProvider email.EmailProvider, logger interfaces.Logger) *SendUserCredentialsJob {
	return &SendUserCredentialsJob{
		BaseJob:       NewBaseJob("send_user_credentials"),
		emailProvider: emailProvider,
		logger:        logger,
	}
}

// ProcessTask processes the send user credentials task
func (j *SendUserCredentialsJob) ProcessTask(ctx context.Context, task *asynq.Task) error {
	var payload SendUserCredentialsJobPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return fmt.Errorf("failed to unmarshal payload: %v", err)
	}

	if err := j.emailProvider.SendUserCredentialsEmail(payload.Email, payload.InviterName, payload.AcceptURL, payload.Password); err != nil {
		return fmt.Errorf("failed to send user credentials email: %v", err)
	}

	j.logger.Info("Successfully sent user credentials email to %s", payload.Email)

	return nil
}
