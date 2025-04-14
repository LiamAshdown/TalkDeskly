package jobs

import (
	"log"
	"os"
	"os/signal"
	"syscall"
)

// InitJobServer initializes and starts the job server
func InitJobServer(redisAddr string, deps JobDependencies) *Server {
	// Initialize job server
	jobServer := NewServer(redisAddr)

	// Register job handlers
	RegisterJobHandlers(jobServer, deps)

	// Handle graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// Start job server
	go func() {
		log.Println("Starting job server...")
		if err := jobServer.Start(); err != nil {
			log.Fatalf("Failed to start job server: %v", err)
		}
	}()

	// Handle shutdown in a separate goroutine
	go func() {
		<-quit
		log.Println("Shutting down job server...")
		jobServer.Stop()
	}()

	return jobServer
}

func RegisterJobHandlers(jobServer *Server, deps JobDependencies) {
	sendInviteJob := NewSendInviteJob(deps.GetEmailProvider())
	jobServer.RegisterHandler("send_invite", sendInviteJob)

	sendWelcomeJob := NewSendWelcomeJob(deps.GetEmailProvider())
	jobServer.RegisterHandler("send_welcome", sendWelcomeJob)
}
