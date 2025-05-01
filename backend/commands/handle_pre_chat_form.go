package commands

import (
	"encoding/json"
	"live-chat-server/interfaces"
	"live-chat-server/listeners"
	"live-chat-server/models"
	"live-chat-server/repositories"
	"live-chat-server/types"
)

// HandlePreChatFormCommand represents the command to handle pre-chat form data
type HandlePreChatFormCommand struct {
	Client       *types.WebSocketClient
	Conversation *models.Conversation
	FormData     map[string]interface{}

	// DI dependencies
	conversationRepo repositories.ConversationRepository
	contactRepo      repositories.ContactRepository
	inboxRepo        repositories.InboxRepository
	logger           interfaces.Logger
	dispatcher       interfaces.Dispatcher
}

// Handle implements the Command interface
func (c *HandlePreChatFormCommand) Handle() (interface{}, error) {
	if c.FormData == nil {
		return nil, nil
	}

	// Map the form data to the contact fields
	mappedFormData, err := c.mapContactFromFormData()
	if err != nil {
		return nil, err
	}

	// Marshal form data to JSON
	metadataBytes, err := json.Marshal(
		map[string]interface{}{
			"pre_chat_form": mappedFormData,
		},
	)

	if err != nil {
		return nil, err
	}

	// Convert to *json.RawMessage
	rawJSON := json.RawMessage(metadataBytes)
	c.Conversation.Metadata = &rawJSON
	if err := c.conversationRepo.UpdateConversation(c.Conversation); err != nil {
		return nil, err
	}

	// Update contact information from form data
	_, err = c.updateContactFromFormData(mappedFormData)
	if err != nil {
		return nil, err
	}

	// Now re-fetch the conversation as the contact may of been updated
	conversation, err := c.conversationRepo.GetConversationByID(c.Conversation.ID, "Messages", "Inbox", "Contact", "AssignedTo")
	if err != nil {
		return nil, err
	}

	internalMessage := &listeners.InternalMessagePayload{
		ConversationID: c.Conversation.ID,
		Content:        "Pre-chat form submitted",
		Type:           "text",
		Metadata:       metadataBytes,
	}

	// Set sender information
	internalMessage.Sender.Type = types.SenderType(string(models.SenderTypeContact))
	internalMessage.Sender.ID = c.Client.GetID()

	// Create message payload
	messagePayload := map[string]interface{}{
		"message":      internalMessage,
		"conversation": conversation,
	}

	// Dispatch the event for the listener to handle
	c.dispatcher.Dispatch(interfaces.EventTypeConversationSendMessage, messagePayload)

	c.Conversation = conversation

	return nil, nil
}

func (c *HandlePreChatFormCommand) mapContactFromFormData() ([]types.PreChatFormField, error) {
	inbox, err := c.inboxRepo.GetInboxByID(c.Conversation.InboxID)
	if err != nil {
		return nil, err
	}

	mappedFormData := make([]types.PreChatFormField, 0)

	// Map the formdata into the inbox fields
	for _, field := range inbox.WebChat.PreChatForm.Fields {
		if value, ok := c.FormData[field.ID]; ok {
			mappedFormData = append(mappedFormData, types.PreChatFormField{
				ID:           field.ID,
				Type:         field.Type,
				Value:        value.(string),
				ContactField: field.ContactField,
			})
		}
	}

	return mappedFormData, nil
}

// updateContactFromFormData updates contact information based on form data
func (c *HandlePreChatFormCommand) updateContactFromFormData(mappedFormData []types.PreChatFormField) (*models.Contact, error) {
	contact, err := c.contactRepo.GetContactByID(c.Client.GetID())
	if err != nil {
		return nil, err
	}

	for _, field := range mappedFormData {
		switch field.ContactField {
		case "name":
			contact.Name = &field.Value
		case "email":
			contact.Email = &field.Value
		case "phone":
			contact.Phone = &field.Value
		}
	}

	// If both the created at and updated at timestamps are the same
	// This means the name was a dummy placeholder, so we can update it
	if contact.CreatedAt == contact.UpdatedAt {
		return contact, c.contactRepo.UpdateContact(contact)
	}

	return contact, nil
}

// NewHandlePreChatFormCommand creates a new HandlePreChatFormCommand
func NewHandlePreChatFormCommand(
	client *types.WebSocketClient,
	conversation *models.Conversation,
	formData map[string]interface{},
	conversationRepo repositories.ConversationRepository,
	contactRepo repositories.ContactRepository,
	inboxRepo repositories.InboxRepository,
	logger interfaces.Logger,
	dispatcher interfaces.Dispatcher,
) interfaces.Command {
	return &HandlePreChatFormCommand{
		Client:           client,
		Conversation:     conversation,
		FormData:         formData,
		conversationRepo: conversationRepo,
		contactRepo:      contactRepo,
		inboxRepo:        inboxRepo,
		logger:           logger,
		dispatcher:       dispatcher,
	}
}
