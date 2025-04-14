package jobs

import "live-chat-server/email"

// JobDependencies defines the dependencies required by jobs
type JobDependencies interface {
	GetEmailProvider() email.EmailProvider
}
