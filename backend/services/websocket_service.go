package services

import (
	"live-chat-server/interfaces"
	"live-chat-server/types"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"go.uber.org/dig"
)

// WebSocketService implements the websocket service interface
type WebSocketService struct {
	pubSub     interfaces.PubSub
	dispatcher interfaces.Dispatcher
	logger     interfaces.Logger
}

// WebSocketServiceParams are the dependencies for the WebSocketService
type WebSocketServiceParams struct {
	dig.In
	PubSub     interfaces.PubSub
	Dispatcher interfaces.Dispatcher
	Logger     interfaces.Logger
}

// NewWebSocketService creates a new WebSocketService
func NewWebSocketService(params WebSocketServiceParams) interfaces.WebSocketService {
	return &WebSocketService{
		pubSub:     params.PubSub,
		dispatcher: params.Dispatcher,
		logger:     params.Logger,
	}
}

// InitializeClient initializes a new WebSocket client
func (s *WebSocketService) InitializeClient(c *types.WebSocketConn, userID, userType, companyID string) *types.WebSocketClient {
	client := &types.WebSocketClient{
		Conn:      c,
		ID:        userID,
		Type:      userType,
		CompanyID: companyID,
		Locals:    make(map[string]interface{}),
	}

	// Send a connection established message
	err := client.SendMessage(types.EventTypeConnectionEstablished, map[string]string{
		"status":    "connected",
		"user_id":   userID,
		"user_type": userType,
	})

	if err != nil {
		s.logger.Error("Failed to send connection established message", "error", err, "user_id", userID)
	}

	// Subscribe to relevant topics
	if userType == "agent" {
		// Agents subscribe to company channel to receive all conversations
		s.pubSub.Subscribe(client, "company:"+companyID)

		// Subscribe to personal channel for direct messages
		s.pubSub.Subscribe(client, "user:"+userID)
	} else if userType == "contact" {
		// Contacts subscribe to their own channel
		s.pubSub.Subscribe(client, "contact:"+userID)
	}

	return client
}

// RegisterWebSocketServices registers websocket services in the DI container
func RegisterWebSocketServices(container *dig.Container) {
	// Register the PubSub service
	if err := container.Provide(NewPubSubService); err != nil {
		panic(err)
	}

	// Register the WebSocket service
	if err := container.Provide(NewWebSocketService); err != nil {
		panic(err)
	}
}

// WebSocketUpgradeMiddleware upgrades HTTP requests to WebSocket connections
func WebSocketUpgradeMiddleware() fiber.Handler {
	return websocket.New(func(c *websocket.Conn) {
		// The actual WebSocket handler will be implemented in the handlers package
		// This middleware just handles the upgrade
	})
}
