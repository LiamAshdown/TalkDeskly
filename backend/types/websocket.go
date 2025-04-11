package types

import (
	"sync"

	"github.com/gofiber/websocket/v2"
)

// WebSocketConn is an alias for the websocket.Conn type
type WebSocketConn = websocket.Conn

// WebSocketClient represents a connected WebSocket client
type WebSocketClient struct {
	Conn           *WebSocketConn
	ID             string   // User ID or Contact ID
	Type           string   // "agent" or "contact"
	ConversationID string   // Current conversation ID
	CompanyID      string   // Company ID for the agent
	InboxIDs       []string // List of inbox IDs the agent or contact has access to
	mu             sync.Mutex
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
	c.Conn.Close()
}

// GetID returns the client ID
func (c *WebSocketClient) GetID() string {
	return c.ID
}

// GetType returns the client type
func (c *WebSocketClient) GetType() string {
	return c.Type
}

// GetCompanyID returns the company ID
func (c *WebSocketClient) GetCompanyID() string {
	return c.CompanyID
}

// GetConversationID returns the conversation ID
func (c *WebSocketClient) GetConversationID() string {
	return c.ConversationID
}

// SetConversationID sets the conversation ID
func (c *WebSocketClient) SetConversationID(conversationID string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.ConversationID = conversationID
}

// WebSocketHandler handles WebSocket messages
type WebSocketHandler interface {
	HandleMessage(client *WebSocketClient, msg *WebSocketMessage)
}
