package services

import (
	"live-chat-server/interfaces"
	"live-chat-server/types"
	"sync"

	"go.uber.org/dig"
)

// PubSubService implements the PubSub interface
type PubSubService struct {
	subscribers map[string]map[string]*types.WebSocketClient
	logger      interfaces.Logger
	mu          sync.RWMutex
}

// PubSubServiceParams are the dependencies for the PubSubService
type PubSubServiceParams struct {
	dig.In
	Logger interfaces.Logger
}

// NewPubSubService creates a new PubSubService
func NewPubSubService(params PubSubServiceParams) interfaces.PubSub {
	return &PubSubService{
		subscribers: make(map[string]map[string]*types.WebSocketClient),
		logger:      params.Logger,
	}
}

// Subscribe adds a client to a topic
func (p *PubSubService) Subscribe(client *types.WebSocketClient, topic string) {
	p.mu.Lock()
	defer p.mu.Unlock()

	if _, exists := p.subscribers[topic]; !exists {
		p.subscribers[topic] = make(map[string]*types.WebSocketClient)
	}
	p.subscribers[topic][client.GetID()] = client
	p.logger.Info("Client subscribed to topic", "client_id", client.GetID(), "topic", topic)
}

// Unsubscribe removes a client from a topic
func (p *PubSubService) Unsubscribe(client *types.WebSocketClient, topic string) {
	p.mu.Lock()
	defer p.mu.Unlock()

	if _, exists := p.subscribers[topic]; exists {
		delete(p.subscribers[topic], client.GetID())
		// If no more clients in this topic, clean up
		if len(p.subscribers[topic]) == 0 {
			delete(p.subscribers, topic)
		}
		p.logger.Info("Client unsubscribed from topic", "client_id", client.GetID(), "topic", topic)
	}
}

// UnsubscribeAll removes a client from all topics
func (p *PubSubService) UnsubscribeAll(client *types.WebSocketClient) {
	p.mu.Lock()
	defer p.mu.Unlock()

	for topic, clients := range p.subscribers {
		if _, exists := clients[client.GetID()]; exists {
			delete(p.subscribers[topic], client.GetID())
			// If no more clients in this topic, clean up
			if len(p.subscribers[topic]) == 0 {
				delete(p.subscribers, topic)
			}
		}
	}
	p.logger.Info("Client unsubscribed from all topics", "client_id", client.GetID())
}

// Publish sends a message to all clients in a topic
func (p *PubSubService) Publish(topic string, event types.EventType, payload interface{}) {
	p.mu.RLock()
	defer p.mu.RUnlock()

	if clients, exists := p.subscribers[topic]; exists {
		for _, client := range clients {
			err := client.SendMessage(event, payload)
			if err != nil {
				p.logger.Error("Failed to send message to client", "error", err, "client_id", client.GetID(), "topic", topic)
				// Consider handling disconnected clients here
			}
		}
	}
}

// GetSubscribers returns all clients in a topic
func (p *PubSubService) GetSubscribers(topic string) []*types.WebSocketClient {
	p.mu.RLock()
	defer p.mu.RUnlock()

	var clients []*types.WebSocketClient
	if subs, exists := p.subscribers[topic]; exists {
		for _, client := range subs {
			clients = append(clients, client)
		}
	}
	return clients
}

// GetTopics returns all active topics
func (p *PubSubService) GetTopics() []string {
	p.mu.RLock()
	defer p.mu.RUnlock()

	topics := make([]string, 0, len(p.subscribers))
	for topic := range p.subscribers {
		topics = append(topics, topic)
	}
	return topics
}
