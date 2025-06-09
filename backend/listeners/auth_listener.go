package listeners

import (
	"live-chat-server/interfaces"
	"live-chat-server/services"

	"go.uber.org/dig"
)

type AuthListener struct {
	dispatcher   interfaces.Dispatcher
	pubSub       interfaces.PubSub
	auditService services.AuditService
	logger       interfaces.Logger
}

// UserListenerParams contains dependencies for UserListener
type AuthListenerParams struct {
	dig.In
	Dispatcher   interfaces.Dispatcher
	PubSub       interfaces.PubSub
	AuditService services.AuditService
	Logger       interfaces.Logger
}

type AuthLoginPayload struct {
	UserID string
}

type AuthLogoutPayload struct {
	UserID string
}

type PasswordResetPayload struct {
	UserID string
}

func NewAuthListener(params AuthListenerParams) *AuthListener {
	listener := &AuthListener{
		dispatcher:   params.Dispatcher,
		pubSub:       params.PubSub,
		auditService: params.AuditService,
		logger:       params.Logger.Named("user_listener"),
	}
	listener.subscribe()
	return listener
}

func (l *AuthListener) subscribe() {
	l.dispatcher.Subscribe(interfaces.EventTypeAuthLogin, l.handleAuthLogin)
}

func (l *AuthListener) handleAuthLogin(event interfaces.Event) {
	if payload, ok := event.Payload.(*AuthLoginPayload); ok {
		l.auditService.LogLogin(payload.UserID)
	}
}
