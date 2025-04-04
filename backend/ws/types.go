package ws

import "github.com/gofiber/websocket/v2"

// Conn is an alias for the websocket.Conn type
type Conn = websocket.Conn

// Client represents a connected WebSocket client
type Client struct {
	Conn           *Conn
	ID             string   // User ID or Contact ID
	Type           string   // "agent" or "contact"
	ConversationID string   // Current conversation ID
	CompanyID      string   // Company ID for the agent
	InboxIDs       []string // List of inbox IDs the agent or contact has access to
}

// SendMessage sends a WebSocket message to the client
func (c *Client) SendMessage(event string, payload interface{}) error {
	msg := map[string]interface{}{
		"event":   event,
		"payload": payload,
	}
	return c.Conn.WriteJSON(msg)
}

// SendError sends an error message to the client and closes the connection
func (c *Client) SendError(message, code string) {
	c.SendMessage("error", map[string]string{
		"message": message,
		"code":    code,
	})
	c.Conn.Close()
}

// GetID returns the client ID
func (c *Client) GetID() string {
	return c.ID
}

// GetType returns the client type
func (c *Client) GetType() string {
	return c.Type
}

// GetCompanyID returns the company ID
func (c *Client) GetCompanyID() string {
	return c.CompanyID
}

// Handler handles WebSocket messages
type Handler interface {
	HandleMessage(client *Client, msg map[string]interface{})
}
