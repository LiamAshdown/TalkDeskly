package services

import (
	"live-chat-server/interfaces"
	"sync"
)

type dispatcher struct {
	handlers map[interfaces.EventType][]interfaces.EventHandler
	mu       sync.RWMutex
}

var (
	instance *dispatcher
	once     sync.Once
)

func GetDispatcher() interfaces.Dispatcher {
	once.Do(func() {
		instance = &dispatcher{
			handlers: make(map[interfaces.EventType][]interfaces.EventHandler),
		}
	})
	return instance
}

func (d *dispatcher) Subscribe(eventType interfaces.EventType, handler interfaces.EventHandler) {
	d.mu.Lock()
	defer d.mu.Unlock()
	d.handlers[eventType] = append(d.handlers[eventType], handler)
}

func (d *dispatcher) Dispatch(eventType interfaces.EventType, payload interface{}) {
	d.mu.RLock()
	defer d.mu.RUnlock()

	event := interfaces.Event{
		Type:    eventType,
		Payload: payload,
	}

	for _, handler := range d.handlers[eventType] {
		go handler(event)
	}
}
