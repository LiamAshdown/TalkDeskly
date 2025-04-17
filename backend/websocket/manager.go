package websocket

import (
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/types"
	"log"
	"sync"

	"github.com/gofiber/websocket/v2"
)

// WebSocketManager defines the interface for WebSocket operations
type WebSocketManager interface {
	Run()
	HandleNewConnection(c *websocket.Conn, userID, userType, inboxID string) *types.WebSocketClient
	BroadcastToCompanyAgents(companyID string, message *types.WebSocketMessage)
	BroadcastToInboxAgents(inboxID string, message *types.WebSocketMessage)
	BroadcastToContact(contactID string, message *types.WebSocketMessage)
	BroadcastToConversation(conversationID string, message *types.WebSocketMessage)
	RemoveClient(client *types.WebSocketClient)
	UpdateAgentInboxAccess(userID string)
	BroadcastToAgent(userID string, message *types.WebSocketMessage)
	RegisterHandler(eventType types.EventType, handler types.WebSocketHandler, logger interfaces.Logger)
}

var (
	once sync.Once
)

// Manager handles WebSocket connections and message broadcasting
type Manager struct {
	clients         map[*types.WebSocketClient]bool
	agents          map[*types.WebSocketClient]bool // Separate map for agent clients
	contacts        map[*types.WebSocketClient]bool // Separate map for contact clients
	register        chan *types.WebSocketClient
	unregister      chan *types.WebSocketClient
	broadcast       chan *types.WebSocketMessage
	messageHandlers map[types.EventType]types.WebSocketHandler
	wsService       interfaces.WebSocketService
	mu              sync.RWMutex
}

// NewManager creates a new WebSocket manager
func NewManager(wsService interfaces.WebSocketService) *Manager {
	return &Manager{
		clients:         make(map[*types.WebSocketClient]bool),
		agents:          make(map[*types.WebSocketClient]bool),
		contacts:        make(map[*types.WebSocketClient]bool),
		register:        make(chan *types.WebSocketClient),
		unregister:      make(chan *types.WebSocketClient),
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

// HandleNewConnection handles a new WebSocket connection
func (m *Manager) HandleNewConnection(c *websocket.Conn, userID, userType, inboxID string) *types.WebSocketClient {
	// Create new client
	client := &types.WebSocketClient{
		Conn:   c,
		ID:     userID,
		Type:   userType,
		Locals: make(map[string]interface{}),
	}

	// Use the WebSocketService to initialize the client directly
	client = m.wsService.InitializeClient((*types.WebSocketConn)(c), userID, userType, inboxID)
	if client == nil {
		return nil
	}

	m.register <- client
	return client
}

// RemoveClient removes a client from the manager
func (m *Manager) RemoveClient(client *types.WebSocketClient) {
	m.unregister <- client

	if client.GetType() == "contact" {
		m.HandleContactDisconnection(client)
	}
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

// HandleMessage dispatches a message to the appropriate handler with middleware support
func (m *Manager) HandleMessage(client *types.WebSocketClient, msg *types.WebSocketMessage) {
	// Create a middleware chain
	var index int
	var next func()

	next = func() {
		// If we've executed all middlewares, call the actual handler
		if index >= len(middlewares) {
			m.executeHandler(client, msg)
			return
		}

		// Get current middleware
		middleware := middlewares[index]
		index++

		// Execute middleware
		middleware(client, msg, next)
	}

	// Start the middleware chain
	next()
}

// executeHandler calls the actual handler for the message
func (m *Manager) executeHandler(client *types.WebSocketClient, msg *types.WebSocketMessage) {
	if eventHandler, exists := m.GetHandler(msg.Event); exists {
		eventHandler.HandleMessage(client, msg)
	}
}

// HandleContactDisconnection handles the disconnection of a contact
func (m *Manager) HandleContactDisconnection(client *types.WebSocketClient) {
	// Send a typing stop event to the agent
	if client.ConversationID != "" {
		m.HandleMessage(client, &types.WebSocketMessage{
			Event:   types.EventTypeConversationTypingStop,
			Payload: map[string]string{"conversation_id": client.ConversationID},
		})
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
func (m *Manager) RegisterHandler(eventType types.EventType, handler types.WebSocketHandler, logger interfaces.Logger) {
	m.mu.Lock()
	defer m.mu.Unlock()
	logger.Info("Registering handler for event type %s", eventType)
	m.messageHandlers[eventType] = handler
}

// GetHandler returns the handler for a specific event type
func (m *Manager) GetHandler(eventType types.EventType) (types.WebSocketHandler, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	handler, exists := m.messageHandlers[eventType]
	return handler, exists
}
