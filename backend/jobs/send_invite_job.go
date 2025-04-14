package jobs

import (
	"context"
	"encoding/json"
	"fmt"
	"live-chat-server/email"
	"log"

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
	emailProvider email.EmailProvider
}

// NewSendInviteJob creates a new send invite job
func NewSendInviteJob(emailProvider email.EmailProvider) *SendInviteJob {
	return &SendInviteJob{
		BaseJob:       NewBaseJob("send_invite"),
		emailProvider: emailProvider,
	}
}

// ProcessTask processes the send invite task
func (j *SendInviteJob) ProcessTask(ctx context.Context, task *asynq.Task) error {
	var payload SendInviteJobPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return fmt.Errorf("failed to unmarshal payload: %v", err)
	}

	if err := j.emailProvider.SendInviteEmail(payload.Email, payload.InviterName, payload.AcceptURL); err != nil {
		return fmt.Errorf("failed to send invite email: %v", err)
	}

	log.Printf("Successfully sent invite email to %s for company %s",
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
