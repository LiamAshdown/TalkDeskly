package types

import (
	"sync"

	"github.com/gofiber/websocket/v2"
)

// WebSocketConn is an alias for the websocket.Conn type
type WebSocketConn = websocket.Conn

// WebSocketClient represents a connected WebSocket client
type WebSocketClient struct {
	Conn      *WebSocketConn
	ID        string                 // User ID or Contact ID
	Type      string                 // "agent" or "contact"
	CompanyID string                 // Company ID for the agent
	InboxIDs  []string               // List of inbox IDs the agent or contact has access to
	Locals    map[string]interface{} // Store local context data
	mu        sync.Mutex
}

// SendMessage sends a WebSocket message to the client
func (c *WebSocketClient) SendMessage(event EventType, payload interface{}) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	msg := NewWebSocketMessage(event, payload)
	return c.Conn.WriteJSON(msg)
}

// SendError sends an error message to the client and closes the connection
func (c *WebSocketClient) SendError(message, code string) {
	c.SendMessage(EventTypeError, map[string]string{
		"message": message,
		"code":    code,
	})
}

// GetID returns the client ID
func (c *WebSocketClient) GetID() string {
	return c.ID
}

// GetType returns the client type
func (c *WebSocketClient) GetType() string {
	return c.Type
}

func (c *WebSocketClient) IsAgent() bool {
	return c.Type == "agent"
}

func (c *WebSocketClient) IsContact() bool {
	return c.Type == "contact"
}

// GetCompanyID returns the company ID
func (c *WebSocketClient) GetCompanyID() string {
	return c.CompanyID
}

// WebSocketHandler handles WebSocket messages
type WebSocketHandler interface {
	HandleMessage(client *WebSocketClient, msg *WebSocketMessage)
}
