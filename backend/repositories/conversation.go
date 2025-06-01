package repositories

import (
	"live-chat-server/models"

	"gorm.io/gorm"
)

type ConversationRepository interface {
	GetConversationsByCompanyID(companyID string, preloads ...string) ([]models.Conversation, error)
	GetConversationsForUser(userID string, preloads ...string) ([]models.Conversation, error)
	GetConversationByIdAndCompanyID(id string, companyID string, preloads ...string) (*models.Conversation, error)
	GetConversationByID(id string, preloads ...string) (*models.Conversation, error)
	CreateConversation(conversation *models.Conversation) error
	UpdateConversation(conversation *models.Conversation) error
	CreateMessage(message *models.Message) (*models.Message, error)
	PopulateSender(message *models.Message) (*models.Message, error)
	GetActiveAssignedConversationsForUser(userID string) ([]models.Conversation, error)
	GetConversationsByContactID(contactID string, preloads ...string) ([]models.Conversation, error)
	DeleteConversationsByInboxID(inboxID string) ([]string, error)
	GetMessageByID(id string) (*models.Message, error)
}

type conversationRepository struct {
	db *gorm.DB
}

func NewConversationRepository(db *gorm.DB) ConversationRepository {
	return &conversationRepository{db: db}
}

// applyPreloads applies preloads to the query, with special handling for messages ordering
func (r *conversationRepository) ApplyPreloads(query *gorm.DB, preloads ...string) *gorm.DB {
	for _, preload := range preloads {
		// Special handling for Messages to order by date
		if preload == "Messages" {
			query = query.Preload(preload, func(db *gorm.DB) *gorm.DB {
				return db.Order("created_at ASC")
			})
		} else {
			query = query.Preload(preload)
		}
	}
	return query
}

func (r *conversationRepository) GetConversationsByCompanyID(companyID string, preloads ...string) ([]models.Conversation, error) {
	var conversations []models.Conversation
	query := r.db.Where("company_id = ?", companyID)

	// Check if we need to load senders
	loadSenders := false
	for _, preload := range preloads {
		if preload == "Messages" {
			loadSenders = true
			break
		}
	}

	query = r.ApplyPreloads(query, preloads...)
	if err := query.Find(&conversations).Error; err != nil {
		return nil, err
	}

	// If we need to load senders, do it here
	if loadSenders {
		if err := r.populateMessageSenders(&conversations); err != nil {
			return nil, err
		}
	}

	return conversations, nil
}

func (r *conversationRepository) GetConversationsForUser(userID string, preloads ...string) ([]models.Conversation, error) {
	var conversations []models.Conversation

	var user models.User

	err := r.db.Preload("Inboxes").First(&user, "id = ?", userID).Error
	if err != nil {
		return nil, err
	}

	var inboxIDs []string
	for _, inbox := range user.Inboxes {
		inboxIDs = append(inboxIDs, inbox.ID)
	}

	query := r.db.Where("inbox_id IN ?", inboxIDs).Where("company_id = ?", user.CompanyID)
	query = r.ApplyPreloads(query, preloads...)

	// Custom ordering to prioritize pending and active conversations
	query = query.Order("CASE " +
		"WHEN status = 'pending' THEN 1 " +
		"WHEN status = 'active' THEN 2 " +
		"WHEN status = 'resolved' THEN 3 " +
		"WHEN status = 'closed' THEN 4 " +
		"ELSE 5 END").
		Order("last_message_at DESC").
		Order("created_at DESC")

	err = query.Find(&conversations).Error
	if err != nil {
		return nil, err
	}

	return conversations, nil
}

func (r *conversationRepository) GetConversationByIdAndCompanyID(id string, companyID string, preloads ...string) (*models.Conversation, error) {
	var conversation models.Conversation
	query := r.db.Where("id = ? AND company_id = ?", id, companyID)

	// Check if we need to load senders
	loadSenders := false
	for _, preload := range preloads {
		if preload == "Messages" {
			loadSenders = true
			break
		}
	}

	query = r.ApplyPreloads(query, preloads...)
	if err := query.First(&conversation).Error; err != nil {
		return nil, err
	}

	// If we need to load senders, do it here
	if loadSenders {
		conversations := []models.Conversation{conversation}
		if err := r.populateMessageSenders(&conversations); err != nil {
			return nil, err
		}
		conversation = conversations[0]
	}

	return &conversation, nil
}

func (r *conversationRepository) CreateConversation(conversation *models.Conversation) error {
	return r.db.Create(conversation).Error
}

func (r *conversationRepository) GetConversationByID(id string, preloads ...string) (*models.Conversation, error) {
	var conversation models.Conversation
	query := r.db

	// Check if we need to load senders
	loadSenders := false
	for _, preload := range preloads {
		if preload == "Messages" {
			loadSenders = true
			break
		}
	}

	query = r.ApplyPreloads(query, preloads...)
	if err := query.First(&conversation, "id = ?", id).Error; err != nil {
		return nil, err
	}

	// If we need to load senders, do it here
	if loadSenders {
		conversations := []models.Conversation{conversation}
		if err := r.populateMessageSenders(&conversations); err != nil {
			return nil, err
		}
		conversation = conversations[0]
	}

	return &conversation, nil
}

func (r *conversationRepository) UpdateConversation(conversation *models.Conversation) error {
	return r.db.Save(conversation).Error
}

func (r *conversationRepository) CreateMessage(message *models.Message) (*models.Message, error) {
	err := r.db.Create(message).Error
	if err != nil {
		return nil, err
	}

	// Now update conversation's last message and last message at
	r.db.Model(&models.Conversation{}).Where("id = ?", message.ConversationID).Update("last_message", message.Content).Update("last_message_at", message.CreatedAt)

	// return the message with the conversation
	message, err = r.GetMessageByID(message.ID)
	if err != nil {
		return nil, err
	}

	return message, nil
}

func (r *conversationRepository) GetMessageByID(id string) (*models.Message, error) {
	var message models.Message
	if err := r.db.First(&message, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &message, nil
}

func (r *conversationRepository) PopulateSender(message *models.Message) (*models.Message, error) {
	if message.SenderType == models.SenderTypeAgent {
		agent := models.User{}
		if err := r.db.Where("id = ?", message.SenderID).First(&agent).Error; err != nil {
			return nil, err
		}
		message.AgentSender = &agent
	} else if message.SenderType == models.SenderTypeContact {
		contact := models.Contact{}
		if err := r.db.Where("id = ?", message.SenderID).First(&contact).Error; err != nil {
			return nil, err
		}
		message.ContactSender = &contact
	}
	return message, nil
}

func (r *conversationRepository) GetActiveAssignedConversationsForUser(userID string) ([]models.Conversation, error) {
	var conversations []models.Conversation
	query := r.db.Where("assigned_to_id = ? AND status = ?", userID, models.ConversationStatusActive)
	if err := query.Find(&conversations).Error; err != nil {
		return nil, err
	}
	return conversations, nil
}

// populateMessageSenders populates the AgentSender and ContactSender fields for each message
func (r *conversationRepository) populateMessageSenders(conversations *[]models.Conversation) error {
	// Collect all agent and contact IDs
	agentIDs := make([]string, 0)
	contactIDs := make([]string, 0)

	for i := range *conversations {
		conv := &(*conversations)[i]
		for j := range conv.Messages {
			msg := &conv.Messages[j]
			if msg.SenderType == models.SenderTypeAgent {
				agentIDs = append(agentIDs, *msg.SenderID)
			} else if msg.SenderType == models.SenderTypeContact {
				contactIDs = append(contactIDs, *msg.SenderID)
			}
		}
	}

	// Deduplicate IDs
	agentIDsMap := make(map[string]bool)
	contactIDsMap := make(map[string]bool)

	for _, id := range agentIDs {
		agentIDsMap[id] = true
	}
	for _, id := range contactIDs {
		contactIDsMap[id] = true
	}

	// Fetch all agents
	agents := make(map[string]models.User)
	if len(agentIDsMap) > 0 {
		var agentsList []models.User
		uniqueAgentIDs := make([]string, 0, len(agentIDsMap))
		for id := range agentIDsMap {
			uniqueAgentIDs = append(uniqueAgentIDs, id)
		}

		if err := r.db.Where("id IN ?", uniqueAgentIDs).Find(&agentsList).Error; err != nil {
			return err
		}

		for _, agent := range agentsList {
			agents[agent.ID] = agent
		}
	}

	// Fetch all contacts
	contacts := make(map[string]models.Contact)
	if len(contactIDsMap) > 0 {
		var contactsList []models.Contact
		uniqueContactIDs := make([]string, 0, len(contactIDsMap))
		for id := range contactIDsMap {
			uniqueContactIDs = append(uniqueContactIDs, id)
		}

		if err := r.db.Where("id IN ?", uniqueContactIDs).Find(&contactsList).Error; err != nil {
			return err
		}

		for _, contact := range contactsList {
			contacts[contact.ID] = contact
		}
	}

	// Assign senders to messages
	for i := range *conversations {
		conv := &(*conversations)[i]
		for j := range conv.Messages {
			msg := &conv.Messages[j]
			if msg.SenderType == models.SenderTypeAgent {
				if agent, ok := agents[*msg.SenderID]; ok {
					msg.AgentSender = &agent
				}
			} else if msg.SenderType == models.SenderTypeContact {
				if contact, ok := contacts[*msg.SenderID]; ok {
					msg.ContactSender = &contact
				}
			}
		}
	}

	return nil
}

func (r *conversationRepository) GetConversationsByContactID(contactID string, preloads ...string) ([]models.Conversation, error) {
	var conversations []models.Conversation
	query := r.db.Where("contact_id = ?", contactID)

	// Check if we need to load senders
	loadSenders := false
	for _, preload := range preloads {
		if preload == "Messages" {
			loadSenders = true
			break
		}
	}

	query = r.ApplyPreloads(query, preloads...)
	if err := query.Find(&conversations).Error; err != nil {
		return nil, err
	}

	// If we need to load senders, do it here
	if loadSenders {
		if err := r.populateMessageSenders(&conversations); err != nil {
			return nil, err
		}
	}

	return conversations, nil
}

func (r *conversationRepository) DeleteConversationsByInboxID(inboxID string) ([]string, error) {
	var conversations []models.Conversation
	err := r.db.Where("inbox_id = ?", inboxID).Find(&conversations).Error

	if err != nil {
		return nil, err
	}

	// Bulk delete the conversations
	err = r.db.Where("inbox_id = ?", inboxID).Delete(&models.Conversation{}).Error
	if err != nil {
		return nil, err
	}

	conversationIDs := make([]string, len(conversations))
	for i, conversation := range conversations {
		conversationIDs[i] = conversation.ID
	}

	return conversationIDs, nil
}
