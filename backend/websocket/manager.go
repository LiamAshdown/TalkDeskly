package websocket

import (
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/types"
	"log"
	"sync"

	"live-chat-server/ws"

	"github.com/gofiber/websocket/v2"
)

// WebSocketManager defines the interface for WebSocket operations
type WebSocketManager interface {
	Run()
	HandleNewConnection(c *websocket.Conn, userID, userType, inboxID string) *Client
	BroadcastToCompanyAgents(companyID string, message *types.WebSocketMessage)
	BroadcastToInboxAgents(inboxID string, message *types.WebSocketMessage)
	BroadcastToContact(contactID string, message *types.WebSocketMessage)
	BroadcastToConversation(conversationID string, message *types.WebSocketMessage)
	RemoveClient(client *Client)
	UpdateAgentInboxAccess(userID string)
	BroadcastToAgent(userID string, message *types.WebSocketMessage)
	RegisterHandler(eventType types.EventType, handler types.WebSocketHandler)
}

var (
	once sync.Once
)

// Client represents a connected WebSocket client
type Client struct {
	Conn           *websocket.Conn
	ID             string   // User ID or Contact ID
	Type           string   // "agent" or "contact"
	ConversationID string   // Current conversation ID
	CompanyID      string   // Company ID for the agent
	InboxIDs       []string // List of inbox IDs the agent or contact has access to
	mu             sync.Mutex
}

// SendMessage sends a WebSocket message to the client
func (c *Client) SendMessage(event types.EventType, payload interface{}) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	msg := types.NewWebSocketMessage(event, payload)
	return c.Conn.WriteJSON(msg)
}

// SendError sends an error message to the client and closes the connection
func (c *Client) SendError(message, code string) {
	c.SendMessage(types.EventTypeError, map[string]string{
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

// Manager handles WebSocket connections and message broadcasting
type Manager struct {
	clients         map[*Client]bool
	agents          map[*Client]bool // Separate map for agent clients
	contacts        map[*Client]bool // Separate map for contact clients
	register        chan *Client
	unregister      chan *Client
	broadcast       chan *types.WebSocketMessage
	messageHandlers map[types.EventType]types.WebSocketHandler
	wsService       interfaces.WebSocketService
	mu              sync.RWMutex
}

// NewManager creates a new WebSocket manager
func NewManager(wsService interfaces.WebSocketService) *Manager {
	return &Manager{
		clients:         make(map[*Client]bool),
		agents:          make(map[*Client]bool),
		contacts:        make(map[*Client]bool),
		register:        make(chan *Client),
		unregister:      make(chan *Client),
		broadcast:       make(chan *types.WebSocketMessage),
		messageHandlers: make(map[types.EventType]types.WebSocketHandler),
		wsService:       wsService,
	}
}

// Run starts the WebSocket manager
func (m *Manager) Run() {
	for {
		select {
		case client := <-m.register:
			m.mu.Lock()
			m.clients[client] = true
			if client.Type == "agent" {
				m.agents[client] = true
			} else {
				m.contacts[client] = true
			}
			m.mu.Unlock()

		case client := <-m.unregister:
			m.mu.Lock()
			if _, ok := m.clients[client]; ok {
				delete(m.clients, client)
				if client.Type == "agent" {
					delete(m.agents, client)
				} else {
					delete(m.contacts, client)
				}
				client.Conn.Close()
			}
			m.mu.Unlock()
		}
	}
}

// BroadcastToCompanyAgents sends a message to all agents in a specific company
func (m *Manager) BroadcastToCompanyAgents(companyID string, message *types.WebSocketMessage) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	for client := range m.agents {
		if client.CompanyID == companyID {
			if err := client.SendMessage(message.Event, message.Payload); err != nil {
				log.Printf("Error broadcasting to agent %s: %v", client.ID, err)
				client.Conn.Close()
				delete(m.clients, client)
				delete(m.agents, client)
			}
		}
	}
}

// BroadcastToInboxAgents sends a message to all agents with access to a specific inbox
func (m *Manager) BroadcastToInboxAgents(inboxID string, message *types.WebSocketMessage) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	for client := range m.agents {
		// Check if agent has access to this inbox
		hasAccess := false
		for _, id := range client.InboxIDs {
			if id == inboxID {
				hasAccess = true
				break
			}
		}

		if hasAccess {
			if err := client.SendMessage(message.Event, message.Payload); err != nil {
				log.Printf("Error broadcasting to agent %s: %v", client.ID, err)
				client.Conn.Close()
				delete(m.clients, client)
				delete(m.agents, client)
			}
		}
	}
}

func (m *Manager) BroadcastToContact(contactID string, message *types.WebSocketMessage) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	for client := range m.contacts {
		if client.ID == contactID {
			if err := client.SendMessage(message.Event, message.Payload); err != nil {
				log.Printf("Error broadcasting to contact %s: %v", client.ID, err)
				client.Conn.Close()
				delete(m.clients, client)
				delete(m.contacts, client)
			}
		}
	}
}

// BroadcastToConversation sends a message to all clients in a specific conversation
func (m *Manager) BroadcastToConversation(conversationID string, message *types.WebSocketMessage) {
	// First get the conversation to determine the inbox
	var conversation models.Conversation
	if err := models.DB.First(&conversation, conversationID).Error; err != nil {
		return
	}

	// Broadcast to agents in this inbox
	m.BroadcastToInboxAgents(conversation.InboxID, message)

	// Then send to contacts in this conversation
	m.mu.RLock()
	defer m.mu.RUnlock()

	for client := range m.contacts {
		if client.ConversationID == conversationID {
			if err := client.SendMessage(message.Event, message.Payload); err != nil {
				log.Printf("Error broadcasting to contact %s: %v", client.ID, err)
				client.Conn.Close()
				delete(m.clients, client)
				delete(m.contacts, client)
			}
		}
	}
}

// HandleNewConnection creates a new client for a WebSocket connection
func (m *Manager) HandleNewConnection(c *websocket.Conn, userID, userType, inboxID string) *Client {
	// Convert websocket.Conn to ws.Conn
	wsConn := (*ws.Conn)(c)

	// Use the WebSocketService to initialize the client
	wsClient := m.wsService.InitializeClient(wsConn, userID, userType, inboxID)
	if wsClient == nil {
		return nil
	}

	// Convert ws.Client to websocket.Client
	client := &Client{
		Conn:           c,
		ID:             wsClient.ID,
		Type:           wsClient.Type,
		ConversationID: wsClient.ConversationID,
		CompanyID:      wsClient.CompanyID,
		InboxIDs:       wsClient.InboxIDs,
	}

	m.register <- client
	return client
}

// RemoveClient removes a client from the manager
func (m *Manager) RemoveClient(client *Client) {
	m.unregister <- client
}

// UpdateAgentInboxAccess updates the inbox access for an agent
func (m *Manager) UpdateAgentInboxAccess(userID string) {
	m.mu.Lock()
	defer m.mu.Unlock()

	for client := range m.agents {
		if client.ID == userID {
			// Get inbox IDs from the inbox_users table
			var inboxIDs []string
			models.DB.Table("inbox_users").
				Where("user_id = ?", userID).
				Pluck("inbox_id", &inboxIDs)
			client.InboxIDs = inboxIDs
			break
		}
	}
}

// BroadcastToAgent sends a message to a specific agent
func (m *Manager) BroadcastToAgent(userID string, message *types.WebSocketMessage) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	for client := range m.agents {
		if client.ID == userID {
			if err := client.SendMessage(message.Event, message.Payload); err != nil {
				log.Printf("Error broadcasting to agent %s: %v", client.ID, err)
				client.Conn.Close()
				delete(m.clients, client)
				delete(m.agents, client)
			}
			break
		}
	}
}

// RegisterHandler registers a new WebSocket message handler
func (m *Manager) RegisterHandler(eventType types.EventType, handler types.WebSocketHandler) {
	m.mu.Lock()
	defer m.mu.Unlock()
	log.Printf("Registering handler for event type: %s", eventType)
	m.messageHandlers[eventType] = handler
}

// GetHandler returns the handler for a specific event type
func (m *Manager) GetHandler(eventType types.EventType) (types.WebSocketHandler, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	handler, exists := m.messageHandlers[eventType]
	return handler, exists
}
