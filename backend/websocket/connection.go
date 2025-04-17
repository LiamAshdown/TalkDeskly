package websocket

import (
	"live-chat-server/types"
	"log"
	"time"

	"live-chat-server/interfaces"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

// WebSocketHandler handles WebSocket connections and operations
type WebSocketHandler struct {
	manager *Manager
	logger  interfaces.Logger
}

// NewWebSocketHandler creates a new WebSocketHandler with dependencies
func NewWebSocketHandler(wsService interfaces.WebSocketService, logger interfaces.Logger) *WebSocketHandler {
	logger.Info("Initializing WebSocket manager...")
	// Start the WebSocket manager
	manager := NewManager(wsService)
	go manager.Run()

	// Register middlewares
	RegisterMiddleware(ConversationIDMiddleware)

	logger.Info("WebSocket manager started")
	return &WebSocketHandler{
		manager: manager,
		logger:  logger,
	}
}

// GetManager returns the WebSocket manager instance
func (h *WebSocketHandler) GetManager() *Manager {
	return h.manager
}

// GetManagerInterface returns the WebSocket manager instance as an interface
func (h *WebSocketHandler) GetManagerInterface() interface{} {
	return h.manager
}

// Broadcast sends a message to the broadcast channel
func (h *WebSocketHandler) Broadcast(msg *types.WebSocketMessage) {
	h.manager.broadcast <- msg
}

// HandleWebSocket upgrades the connection to WebSocket and handles the connection
func (h *WebSocketHandler) HandleWebSocket(c *fiber.Ctx) error {
	log.Println("New WebSocket connection request")

	// IsWebSocketUpgrade returns true if the client requested upgrade to the WebSocket protocol
	if !websocket.IsWebSocketUpgrade(c) {
		log.Println("Not a WebSocket upgrade request")
		return fiber.ErrUpgradeRequired
	}

	// Add CORS headers for WebSocket
	c.Set("Access-Control-Allow-Origin", "*")
	c.Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	c.Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")
	c.Set("Access-Control-Allow-Credentials", "true")

	return websocket.New(func(conn *websocket.Conn) {
		// Get user type and ID from query parameters
		userType := conn.Query("type")    // "agent" or "contact"
		userID := conn.Query("user_id")   // User ID or Contact ID
		inboxID := conn.Query("inbox_id") // Inbox ID

		log.Printf("WebSocket connection parameters - type: %s, userID: %s, inboxID: %s", userType, userID, inboxID)

		if userType == "" {
			log.Println("Missing required parameters, closing connection")
			conn.Close()
			return
		}

		if userType == "contact" && inboxID == "" {
			log.Println("Missing required parameters, closing connection")
			conn.Close()
			return
		}

		log.Printf("New WebSocket connection established for user %s of type %s", userID, userType)

		// Create new client
		client := h.manager.HandleNewConnection(conn, userID, userType, inboxID)
		if client == nil {
			log.Println("Failed to create client, closing connection")
			conn.Close()
			return
		}
		defer h.manager.RemoveClient(client)

		// Send a welcome message
		if err := client.SendMessage(types.EventTypeConnectionEstablished, map[string]string{
			"message": "Connected successfully",
			"user_id": client.ID,
			"type":    client.Type,
		}); err != nil {
			log.Printf("Error sending welcome message: %v", err)
		}

		// Handle incoming messages
		for {
			var msg types.WebSocketMessage
			if err := conn.ReadJSON(&msg); err != nil {
				log.Printf("Error reading message: %v", err)
				break
			}

			log.Printf("Received message of type %s from user %s", msg.Event, userID)

			// Set timestamp
			msg.Timestamp = time.Now()

			// Handle different event types
			h.manager.HandleMessage(client, &msg)
		}

		log.Printf("WebSocket connection closed for user %s", userID)
	})(c)
}
