package jobs

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/hibiken/asynq"
)

// JobHandler defines the interface for job handlers
type JobHandler interface {
	ProcessTask(ctx context.Context, task *asynq.Task) error
}

// BaseJob provides common functionality for all jobs
type BaseJob struct {
	Type string
}

// NewBaseJob creates a new base job
func NewBaseJob(jobType string) *BaseJob {
	return &BaseJob{
		Type: jobType,
	}
}

// CreateTask creates a new task with the given payload
func (j *BaseJob) CreateTask(payload interface{}) (*asynq.Task, error) {
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal payload: %v", err)
	}

	return asynq.NewTask(j.Type, payloadBytes), nil
} 