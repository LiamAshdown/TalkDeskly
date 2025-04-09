package services

import (
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/utils"
	"live-chat-server/ws"
	"log"
)

type webSocketService struct {
	container interfaces.Container
}

func NewWebSocketService(c interfaces.Container) interfaces.WebSocketService {
	return &webSocketService{
		container: c,
	}
}

// InitializeClient creates and initializes a new WebSocket client
func (s *webSocketService) InitializeClient(c *ws.Conn, userID, userType, inboxID string) *ws.Client {
	client := &ws.Client{
		Conn: c,
		ID:   userID,
		Type: userType,
	}

	// Handle agent-specific initialization
	if userType == "agent" {
		if err := s.initializeAgentClient(client, userID); err != nil {
			return nil
		}
	} else if userType == "contact" {
		if err := s.initializeContactClient(client, userID, inboxID); err != nil {
			return nil
		}
	}

	return client
}

func (s *webSocketService) initializeAgentClient(client *ws.Client, userID string) error {
	user, err := s.container.GetUserRepo().GetUserByID(userID)
	if err != nil {
		log.Printf("Error getting user %s: %v", userID, err)
		client.SendError("Agent not found", "agent_not_found")
		return err
	}

	if user.CompanyID != nil {
		client.CompanyID = *user.CompanyID
	}

	// Get inbox IDs from the inbox_users table
	inboxes, err := s.container.GetInboxRepo().GetInboxesByCompanyID(*user.CompanyID)
	if err != nil {
		log.Printf("Error getting inbox IDs for user %s: %v", userID, err)
		client.SendError("Failed to get inbox access", "inbox_access_error")
		return err
	}
	client.InboxIDs = make([]string, len(inboxes))
	for i, inbox := range inboxes {
		client.InboxIDs[i] = inbox.ID
	}

	return nil
}

func (s *webSocketService) initializeContactClient(client *ws.Client, userID, inboxID string) error {
	if userID == "" {
		// Create new contact
		inbox, err := s.container.GetInboxRepo().GetInboxByID(inboxID)
		if err != nil {
			client.SendError("Inbox not found", "inbox_not_found")
			return err
		}

		company, err := s.container.GetCompanyRepo().GetCompanyByID(inbox.CompanyID)
		if err != nil {
			client.SendError("No company found", "company_not_found")
			return err
		}

		name := utils.GenerateRandomName()

		contact := &models.Contact{
			CompanyID: company.ID,
			Name:      &name,
		}

		if err := s.container.GetContactRepo().CreateContact(contact); err != nil {
			log.Printf("Error creating contact: %v", err)
			client.SendError("Failed to create contact", "contact_creation_failed")
			return err
		}

		// Update the client with the new contact ID
		client.ID = contact.ID
		client.InboxIDs = []string{inboxID}
		log.Printf("Created new contact with ID: %s and inbox ID: %s", contact.ID, inboxID)

		s.container.GetDispatcher().Dispatch(interfaces.EventTypeContactCreated, contact)
	} else {
		// Find existing contact
		contact, err := s.container.GetContactRepo().GetContactByID(userID)
		if err != nil {
			log.Printf("Error finding contact %s: %v", userID, err)
			client.SendError("Contact not found", "contact_not_found")
			return err
		}
		client.CompanyID = contact.CompanyID
		client.InboxIDs = []string{inboxID}
	}

	return nil
}
