package listeners

import (
	"encoding/json"
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/repositories"
	"live-chat-server/types"
	"time"
)

// InternalMessagePayload is used for standardized message handling within the system
type InternalMessagePayload struct {
	ConversationID string
	Content        string
	Type           string
	Metadata       interface{}
	Private        bool
	Sender         struct {
		ID   string
		Type types.SenderType
	}
}

type ConversationListener struct {
	dispatcher       interfaces.Dispatcher
	pubSub           interfaces.PubSub
	conversationRepo repositories.ConversationRepository
	logger           interfaces.Logger
}

func NewConversationListener(dispatcher interfaces.Dispatcher, pubSub interfaces.PubSub, conversationRepo repositories.ConversationRepository, logger interfaces.Logger) *ConversationListener {
	listener := &ConversationListener{
		dispatcher:       dispatcher,
		pubSub:           pubSub,
		conversationRepo: conversationRepo,
		logger:           logger,
	}
	listener.subscribe()
	return listener
}

func (l *ConversationListener) subscribe() {
	l.dispatcher.Subscribe(interfaces.EventTypeConversationStart, l.HandleConversationStart)
	l.dispatcher.Subscribe(interfaces.EventTypeConversationSendMessage, l.HandleConversationSendMessage)
	l.dispatcher.Subscribe(interfaces.EventTypeConversationGetByID, l.HandleConversationGetByID)
	l.dispatcher.Subscribe(interfaces.EventTypeConversationTyping, l.HandleConversationTyping)
	l.dispatcher.Subscribe(interfaces.EventTypeConversationTypingStop, l.HandleConversationTypingStop)
	l.dispatcher.Subscribe(interfaces.EventTypeConversationAssign, l.HandleConversationAssign)
	l.dispatcher.Subscribe(interfaces.EventTypeConversationClose, l.HandleConversationClose)
}

func (l *ConversationListener) HandleConversationStart(event interfaces.Event) {

}

func (l *ConversationListener) HandleConversationSendMessage(event interfaces.Event) {
	if payload, ok := event.Payload.(map[string]interface{}); ok {
		internalMessage, ok := payload["message"].(*InternalMessagePayload)
		if !ok {
			l.logger.Error("Invalid message format in payload")
			return
		}

		conversation, ok := payload["conversation"].(*models.Conversation)
		if !ok {
			var err error
			conversation, err = l.conversationRepo.GetConversationByID(internalMessage.ConversationID)
			if err != nil {
				l.logger.Error("Error getting conversation:", err)
				return
			}
		}

		// Convert message type if provided
		messageType := models.MessageTypeText
		if internalMessage.Type != "" {
			messageType = models.MessageType(internalMessage.Type)
		}

		// Handle metadata conversion for storage
		var metadataStr *string
		if internalMessage.Metadata != nil {
			// Convert metadata to string
			if metadataJSON, err := json.Marshal(internalMessage.Metadata); err == nil {
				metadataString := string(metadataJSON)
				metadataStr = &metadataString
			} else {
				l.logger.Error("Error marshaling metadata:", err)
			}
		}

		// Create the message model for storage
		messageModel := models.Message{
			ConversationID: internalMessage.ConversationID,
			Content:        internalMessage.Content,
			Type:           messageType,
			SenderType:     models.SenderType(internalMessage.Sender.Type),
			Metadata:       metadataStr,
			Private:        internalMessage.Private,
		}

		// Add sender ID for non-system messages
		if internalMessage.Sender.ID != "" && internalMessage.Sender.Type != types.SenderTypeSystem {
			messageModel.SenderID = &internalMessage.Sender.ID
		}

		// Store the message
		createdMessage, err := l.conversationRepo.CreateMessage(&messageModel)
		if err != nil {
			l.logger.Error("Error creating message:", err)
			return
		}

		// Update conversation's last message and timestamp
		conversation.LastMessage = internalMessage.Content
		now := time.Now()
		conversation.LastMessageAt = &now

		if err := l.conversationRepo.UpdateConversation(conversation); err != nil {
			l.logger.Error("Error updating conversation:", err)
		}

		// Populate sender information if available
		populatedMessage, err := l.conversationRepo.PopulateSender(createdMessage)
		if err != nil {
			l.logger.Error("Error populating sender:", err)
			// Continue with unpopulated message if there's an error
			populatedMessage = createdMessage
		}

		// Broadcast the message to the conversation channel
		l.pubSub.Publish("conversation:"+internalMessage.ConversationID, types.EventTypeConversationSendMessage, populatedMessage.ToPayload())

		// Broadcast conversation update to company channel
		l.pubSub.Publish("company:"+conversation.CompanyID, types.EventTypeConversationUpdate, conversation.ToPayloadWithoutMessages())
	}
}

func (l *ConversationListener) HandleConversationGetByID(event interfaces.Event) {
	if payload, ok := event.Payload.(map[string]interface{}); ok {
		if conversation, ok := payload["conversation"].(*models.Conversation); ok {
			if client, ok := payload["client"].(*types.WebSocketClient); ok {
				if client.IsAgent() {
					// Send the conversation directly to the requesting client
					client.SendMessage(types.EventTypeConversationGetByID, conversation.ToPayloadWithMessages())
				} else {
					// Send the conversation to the company channel
					client.SendMessage(types.EventTypeConversationGetByID, conversation.ToPayloadWithoutPrivateMessages())
				}
			}
		}
	}
}

func (l *ConversationListener) HandleConversationTyping(event interfaces.Event) {
	if conversation, ok := event.Payload.(*models.Conversation); ok {
		l.pubSub.Publish("conversation:"+conversation.ID, types.EventTypeConversationTyping, conversation.ID)
	}
}

func (l *ConversationListener) HandleConversationTypingStop(event interfaces.Event) {
	if conversation, ok := event.Payload.(*models.Conversation); ok {
		l.pubSub.Publish("conversation:"+conversation.ID, types.EventTypeConversationTypingStop, conversation.ID)
	}
}

func (l *ConversationListener) HandleConversationAssign(event interfaces.Event) {
	if payload, ok := event.Payload.(map[string]interface{}); ok {
		if conversation, ok := payload["conversation"].(*models.Conversation); ok {
			// Broadcast assignment to company channel
			l.pubSub.Publish("company:"+conversation.CompanyID, types.EventTypeConversationUpdate, conversation.ToPayloadWithoutMessages())

			// Also broadcast to the conversation channel
			l.pubSub.Publish("conversation:"+conversation.ID, types.EventTypeConversationUpdate, conversation.ToPayloadWithoutMessages())
		}
	}
}

func (l *ConversationListener) HandleConversationClose(event interfaces.Event) {
	if payload, ok := event.Payload.(map[string]interface{}); ok {
		if conversation, ok := payload["conversation"].(*models.Conversation); ok {
			// Broadcast closure to company channel
			l.pubSub.Publish("company:"+conversation.CompanyID, types.EventTypeConversationClose, conversation.ToPayloadWithoutMessages())

			// Also broadcast to the conversation channel
			l.pubSub.Publish("conversation:"+conversation.ID, types.EventTypeConversationClose, conversation.ToPayloadWithoutMessages())
		}
	}
}
