package jobs

import (
	"context"
	"time"

	"github.com/hibiken/asynq"
)

// Client manages job enqueuing
type Client struct {
	client *asynq.Client
}

// NewClient creates a new job client
func NewClient(redisAddr string) *Client {
	redisOpt := asynq.RedisClientOpt{Addr: redisAddr}
	client := asynq.NewClient(redisOpt)
	
	return &Client{
		client: client,
	}
}

// Enqueue enqueues a task with the given options
func (c *Client) Enqueue(task *asynq.Task, opts ...asynq.Option) error {
	_, err := c.client.Enqueue(task, opts...)
	return err
}

// EnqueueWithContext enqueues a task with context and options
func (c *Client) EnqueueWithContext(ctx context.Context, task *asynq.Task, opts ...asynq.Option) error {
	_, err := c.client.EnqueueContext(ctx, task, opts...)
	return err
}

// Close closes the client connection
func (c *Client) Close() error {
	return c.client.Close()
}

// Common task options
var (
	// Process immediately
	ProcessImmediately = []asynq.Option{}

	// Process after delay
	ProcessAfter = func(delay time.Duration) []asynq.Option {
		return []asynq.Option{asynq.ProcessIn(delay)}
	}

	// Process at specific time
	ProcessAt = func(t time.Time) []asynq.Option {
		return []asynq.Option{asynq.ProcessAt(t)}
	}

	// High priority queue
	HighPriority = []asynq.Option{asynq.Queue("critical")}

	// Low priority queue
	LowPriority = []asynq.Option{asynq.Queue("low")}
) 