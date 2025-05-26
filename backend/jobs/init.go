package jobs

import (
	"live-chat-server/interfaces"
	"os"
	"os/signal"
	"syscall"
)

// RegisterJobServer initializes and starts the job server with an email service
func RegisterJobServer(redisAddr string, emailService interfaces.EmailService, logger interfaces.Logger) *Server {
	// Initialize job server
	jobServer := NewServer(redisAddr)

	// Register job handlers
	registerJobHandlers(jobServer, emailService, logger)

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
func registerJobHandlers(jobServer *Server, emailService interfaces.EmailService, logger interfaces.Logger) {
	sendInviteJob := NewSendInviteJob(emailService, logger)
	jobServer.RegisterHandler("send_invite", sendInviteJob)

	sendUserCredentialsJob := NewSendUserCredentialsJob(emailService, logger)
	jobServer.RegisterHandler("send_user_credentials", sendUserCredentialsJob)

	emailJob := NewSendEmailJob(emailService, logger)
	jobServer.RegisterHandler("send_email", emailJob)
}
