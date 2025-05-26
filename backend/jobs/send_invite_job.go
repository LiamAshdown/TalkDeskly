package jobs

import (
	"context"
	"encoding/json"
	"fmt"
	"live-chat-server/interfaces"

	"github.com/hibiken/asynq"
)

// SendInviteJobPayload defines the payload for the send invite job
type SendInviteJobPayload struct {
	Email       string `json:"email"`
	CompanyID   string `json:"company_id"`
	InviterName string `json:"inviter_name"`
	AcceptURL   string `json:"accept_url"`
}

// SendInviteJob handles sending agent invite emails
type SendInviteJob struct {
	*BaseJob
	emailService interfaces.EmailService
	logger       interfaces.Logger
}

// NewSendInviteJob creates a new send invite job
func NewSendInviteJob(emailService interfaces.EmailService, logger interfaces.Logger) *SendInviteJob {
	return &SendInviteJob{
		BaseJob:      NewBaseJob("send_invite"),
		emailService: emailService,
		logger:       logger,
	}
}

// ProcessTask processes the send invite task
func (j *SendInviteJob) ProcessTask(ctx context.Context, task *asynq.Task) error {
	var payload SendInviteJobPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return fmt.Errorf("failed to unmarshal payload: %v", err)
	}

	if err := j.emailService.SendInviteEmail(payload.Email, payload.InviterName, payload.AcceptURL); err != nil {
		return fmt.Errorf("failed to send invite email: %v", err)
	}

	j.logger.Info("Successfully sent invite email to %s for company %s",
		payload.Email,
		payload.CompanyID)

	return nil
}

// CreateSendInviteTask creates a new send invite task
func (j *SendInviteJob) CreateSendInviteTask(email, companyID, inviterName, acceptURL string) (*asynq.Task, error) {
	payload := SendInviteJobPayload{
		Email:       email,
		CompanyID:   companyID,
		InviterName: inviterName,
		AcceptURL:   acceptURL,
	}
	return j.CreateTask(payload)
}
