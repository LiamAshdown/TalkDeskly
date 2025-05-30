package listeners

import (
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/repositories"
	"live-chat-server/types"
	"time"

	"go.uber.org/dig"
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
	dispatcher          interfaces.Dispatcher
	pubSub              interfaces.PubSub
	conversationRepo    repositories.ConversationRepository
	userRepo            repositories.UserRepository
	logger              interfaces.Logger
	notificationService interfaces.NotificationService
	commandFactory      interfaces.CommandFactory
}

// ConversationListenerParams contains dependencies for ConversationListener
type ConversationListenerParams struct {
	dig.In
	Dispatcher          interfaces.Dispatcher
	PubSub              interfaces.PubSub
	ConversationRepo    repositories.ConversationRepository
	UserRepo            repositories.UserRepository
	Logger              interfaces.Logger
	NotificationService interfaces.NotificationService
	CommandFactory      interfaces.CommandFactory
}

func NewConversationListener(params ConversationListenerParams) *ConversationListener {
	listener := &ConversationListener{
		dispatcher:          params.Dispatcher,
		pubSub:              params.PubSub,
		conversationRepo:    params.ConversationRepo,
		userRepo:            params.UserRepo,
		logger:              params.Logger,
		notificationService: params.NotificationService,
		commandFactory:      params.CommandFactory,
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
	if conversation, ok := event.Payload.(*models.Conversation); ok {
		l.pubSub.Publish("company:"+conversation.CompanyID, types.EventTypeConversationStart, conversation.ToPayloadWithoutMessages())
		l.pubSub.Publish("conversation:"+conversation.ID, types.EventTypeConversationStart, conversation.ToPayloadWithoutMessages())
	}
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

		metaData := internalMessage.Metadata

		// Create the message model for storage
		messageModel := models.Message{
			ConversationID: internalMessage.ConversationID,
			Content:        internalMessage.Content,
			Type:           messageType,
			SenderType:     models.SenderType(internalMessage.Sender.Type),
			Metadata:       metaData,
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

		l.commandFactory.NewHandleMessageNotificationCommand(conversation, populatedMessage).Handle()

		// If the message is private, then only broadcast the message to agent conversation
		if internalMessage.Private {
			l.pubSub.Publish("conversation-agent:"+internalMessage.ConversationID, types.EventTypeConversationSendMessage, populatedMessage.ToPayload())
		} else {
			// Broadcast the message to the conversation channel
			l.pubSub.Publish("conversation:"+internalMessage.ConversationID, types.EventTypeConversationSendMessage, populatedMessage.ToPayload())
		}

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
	if conversation, ok := event.Payload.(*models.Conversation); ok {
		// Broadcast assignment to company channel
		l.pubSub.Publish("company:"+conversation.CompanyID, types.EventTypeConversationUpdate, conversation.ToPayloadWithoutMessages())

		// Also broadcast to the conversation channel
		l.pubSub.Publish("conversation:"+conversation.ID, types.EventTypeConversationUpdate, conversation.ToPayloadWithoutMessages())
	}

}

func (l *ConversationListener) HandleConversationClose(event interfaces.Event) {
	if conversation, ok := event.Payload.(*models.Conversation); ok {
		l.pubSub.Publish("company:"+conversation.CompanyID, types.EventTypeConversationClose, conversation.ToPayloadWithoutMessages())
		l.pubSub.Publish("conversation:"+conversation.ID, types.EventTypeConversationClose, conversation.ToPayloadWithoutMessages())
	}
}
