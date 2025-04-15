package jobs

import (
	"live-chat-server/email"
	"live-chat-server/interfaces"
	"os"
	"os/signal"
	"syscall"
)

// RegisterJobServer initializes and starts the job server with an email provider
func RegisterJobServer(redisAddr string, emailProvider email.EmailProvider, logger interfaces.Logger) *Server {
	// Initialize job server
	jobServer := NewServer(redisAddr)

	// Register job handlers
	registerJobHandlers(jobServer, emailProvider, logger)

	// Handle graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// Start job server
	go func() {
		logger.Info("Starting job server...")
		if err := jobServer.Start(); err != nil {
			logger.Error("Failed to start job server: %v", map[string]interface{}{"error": err})
		}
	}()

	// Handle shutdown in a separate goroutine
	go func() {
		<-quit
		logger.Info("Shutting down job server...")
		jobServer.Stop()
	}()

	return jobServer
}

// registerJobHandlers registers all job handlers
func registerJobHandlers(jobServer *Server, emailProvider email.EmailProvider, logger interfaces.Logger) {
	sendInviteJob := NewSendInviteJob(emailProvider, logger)
	jobServer.RegisterHandler("send_invite", sendInviteJob)

	sendWelcomeJob := NewSendWelcomeJob(emailProvider)
	jobServer.RegisterHandler("send_welcome", sendWelcomeJob)
}
