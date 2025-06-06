package listeners

import (
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/services"
	"live-chat-server/types"

	"go.uber.org/dig"
)

type UserListener struct {
	dispatcher   interfaces.Dispatcher
	pubSub       interfaces.PubSub
	auditService services.AuditService
	logger       interfaces.Logger
}

// UserListenerParams contains dependencies for UserListener
type UserListenerParams struct {
	dig.In
	Dispatcher   interfaces.Dispatcher
	PubSub       interfaces.PubSub
	AuditService services.AuditService
	Logger       interfaces.Logger
}

func NewUserListener(params UserListenerParams) *UserListener {
	listener := &UserListener{
		dispatcher:   params.Dispatcher,
		pubSub:       params.PubSub,
		auditService: params.AuditService,
		logger:       params.Logger.Named("user_listener"),
	}
	listener.subscribe()
	return listener
}

func (l *UserListener) subscribe() {
	l.dispatcher.Subscribe(interfaces.EventTypeUserCreated, l.handleUserCreated)
	l.dispatcher.Subscribe(interfaces.EventTypeUserUpdated, l.handleUserUpdated)
	l.dispatcher.Subscribe(interfaces.EventTypeUserDeleted, l.handleUserDeleted)
}

// UserCreatedPayload represents the payload for user created events
type UserCreatedPayload struct {
	User     *models.User           `json:"user"`
	ActorID  string                 `json:"actor_id"`
	Metadata map[string]interface{} `json:"metadata,omitempty"`
}

// UserUpdatedPayload represents the payload for user updated events
type UserUpdatedPayload struct {
	User     *models.User           `json:"user"`
	ActorID  string                 `json:"actor_id"`
	Changes  map[string]interface{} `json:"changes,omitempty"`
	Metadata map[string]interface{} `json:"metadata,omitempty"`
}

// UserDeletedPayload represents the payload for user deleted events
type UserDeletedPayload struct {
	UserID    string `json:"user_id"`
	CompanyID string `json:"company_id"`
	ActorID   string `json:"actor_id"`
	Email     string `json:"email,omitempty"`
}

// UserAuthPayload represents the payload for authentication events
type UserAuthPayload struct {
	UserID    *string `json:"user_id,omitempty"`
	CompanyID *string `json:"company_id,omitempty"`
	Email     string  `json:"email"`
	IPAddress string  `json:"ip_address"`
	UserAgent string  `json:"user_agent"`
	Success   bool    `json:"success"`
}

func (l *UserListener) handleUserCreated(event interfaces.Event) {
	if payload, ok := event.Payload.(*UserCreatedPayload); ok {
		// Log audit event
		go func() {
			if err := l.auditService.LogUserCreate(payload.ActorID, payload.User.ID, payload.Metadata); err != nil {
				l.logger.Error("Failed to log user creation audit event", map[string]interface{}{
					"user_id":  payload.User.ID,
					"actor_id": payload.ActorID,
					"error":    err.Error(),
				})
			}
		}()

		// Broadcast to company channel
		if payload.User.CompanyID != nil {
			l.pubSub.Publish("company:"+*payload.User.CompanyID, types.EventTypeUserNotificationCreated, payload.User.ToResponse())
		}
	}
}

func (l *UserListener) handleUserUpdated(event interfaces.Event) {
	if payload, ok := event.Payload.(*UserUpdatedPayload); ok {
		// Log audit event
		go func() {
			metadata := payload.Metadata
			if metadata == nil {
				metadata = make(map[string]interface{})
			}
			if payload.Changes != nil {
				metadata["changes"] = payload.Changes
			}

			if err := l.auditService.LogUserUpdate(payload.ActorID, payload.User.ID, metadata); err != nil {
				l.logger.Error("Failed to log user update audit event", map[string]interface{}{
					"user_id":  payload.User.ID,
					"actor_id": payload.ActorID,
					"error":    err.Error(),
				})
			}
		}()

		// Broadcast to company channel
		if payload.User.CompanyID != nil {
			l.pubSub.Publish("company:"+*payload.User.CompanyID, types.EventTypeUserNotificationCreated, payload.User.ToResponse())
		}
	}
}

func (l *UserListener) handleUserDeleted(event interfaces.Event) {
	if payload, ok := event.Payload.(*UserDeletedPayload); ok {
		// Log audit event
		go func() {
			if err := l.auditService.LogUserDelete(payload.ActorID, payload.UserID); err != nil {
				l.logger.Error("Failed to log user deletion audit event", map[string]interface{}{
					"user_id":  payload.UserID,
					"actor_id": payload.ActorID,
					"error":    err.Error(),
				})
			}
		}()

		// Broadcast to company channel
		l.pubSub.Publish("company:"+payload.CompanyID, types.EventTypeUserNotificationCreated, map[string]interface{}{
			"user_id":    payload.UserID,
			"deleted":    true,
			"deleted_by": payload.ActorID,
		})
	}
}
