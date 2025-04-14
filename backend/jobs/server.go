package jobs

import (
	"log"

	"github.com/hibiken/asynq"
)

// JobContainer defines the minimal interface needed by the job server

// Server manages the job processing
type Server struct {
	server *asynq.Server
	mux    *asynq.ServeMux
	Client *Client
}

// NewServer creates a new job server
func NewServer(redisAddr string) *Server {
	redisOpt := asynq.RedisClientOpt{Addr: redisAddr}

	server := asynq.NewServer(
		redisOpt,
		asynq.Config{
			// Specify how many concurrent workers to use
			Concurrency: 10,
			// Optionally specify multiple queues with different priority
			Queues: map[string]int{
				"critical": 6,
				"default":  3,
				"low":      1,
			},
		},
	)

	mux := asynq.NewServeMux()

	return &Server{
		server: server,
		mux:    mux,
		Client: NewClient(redisAddr),
	}
}

// RegisterHandler registers a new job handler
func (s *Server) RegisterHandler(pattern string, handler JobHandler) {
	s.mux.HandleFunc(pattern, handler.ProcessTask)
}

// Start starts the job server
func (s *Server) Start() error {
	if err := s.server.Run(s.mux); err != nil {
		log.Printf("could not run server: %v", err)
		return err
	}
	return nil
}

// Stop stops the job server
func (s *Server) Stop() {
	s.server.Stop()
	s.server.Shutdown()
}
