package handler

import (
	"live-chat-server/interfaces"
	"live-chat-server/listeners"
	"live-chat-server/models"
	"live-chat-server/repositories"
	"live-chat-server/types"
	"live-chat-server/utils"

	"github.com/gofiber/fiber/v2"
)

type ContactInput struct {
	Name    *string `json:"name" validate:"optional=min=2,max=255"`
	Email   *string `json:"email" validate:"optional=email"`
	Phone   *string `json:"phone" validate:"optional=min=5,max=50"`
	Company *string `json:"company" validate:"optional=min=2,max=255"`
}

type ContactNoteInput struct {
	Content string `json:"content" validate:"required"`
}

type ContactHandler struct {
	repo             repositories.ContactRepository
	conversationRepo repositories.ConversationRepository
	securityContext  interfaces.SecurityContext
	dispatcher       interfaces.Dispatcher
	logger           interfaces.Logger
	langContext      interfaces.LanguageContext
}

func NewContactHandler(repo repositories.ContactRepository, conversationRepo repositories.ConversationRepository, securityContext interfaces.SecurityContext, dispatcher interfaces.Dispatcher, logger interfaces.Logger, langContext interfaces.LanguageContext) *ContactHandler {
	handlerLogger := logger.Named("contact_handler")
	return &ContactHandler{
		repo:             repo,
		conversationRepo: conversationRepo,
		securityContext:  securityContext,
		dispatcher:       dispatcher,
		logger:           handlerLogger,
		langContext:      langContext,
	}
}

func (h *ContactHandler) HandleGetContact(c *fiber.Ctx) error {
	contactID := c.Params("id")
	user := h.securityContext.GetAuthenticatedUser(c)

	contact, err := h.repo.GetContactByIDAndCompanyID(contactID, *user.User.CompanyID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, h.langContext.T(c, "contact_not_found"), err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "contact_found"), contact.ToResponse())
}

func (h *ContactHandler) HandleListContacts(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	contacts, err := h.repo.GetContactsByCompanyID(*user.User.CompanyID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_fetch_contacts"), err)
	}

	responses := make([]interface{}, len(contacts))
	for i, contact := range contacts {
		responses[i] = contact.ToResponse()
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "contacts_fetched"), responses)
}

func (h *ContactHandler) HandleCreateContact(c *fiber.Ctx) error {
	var input ContactInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "bad_request"), err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	user := h.securityContext.GetAuthenticatedUser(c)

	contact := models.Contact{
		Name:      input.Name,
		Email:     input.Email,
		Phone:     input.Phone,
		Company:   input.Company,
		CompanyID: *user.User.CompanyID,
	}

	if err := h.repo.CreateContact(&contact); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_create_contact"), err)
	}

	h.dispatcher.Dispatch(interfaces.EventTypeContactCreated, &listeners.ContactCreatedPayload{
		Contact: &contact,
		User:    user.User,
	})

	return utils.SuccessResponse(c, fiber.StatusCreated, h.langContext.T(c, "contact_created"), contact.ToResponse())
}

func (h *ContactHandler) HandleUpdateContact(c *fiber.Ctx) error {
	contactID := c.Params("id")
	user := h.securityContext.GetAuthenticatedUser(c)

	var input ContactInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "bad_request"), err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	contact, err := h.repo.GetContactByIDAndCompanyID(contactID, *user.User.CompanyID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, h.langContext.T(c, "contact_not_found"), err)
	}

	contact.Name = input.Name
	contact.Email = input.Email
	contact.Phone = input.Phone
	contact.Company = input.Company

	if err := h.repo.UpdateContact(contact); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_update_contact"), err)
	}

	h.dispatcher.Dispatch(interfaces.EventTypeContactUpdated, &listeners.ContactUpdatedPayload{
		Contact: contact,
		User:    user.User,
	})

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "contact_updated"), contact.ToResponse())
}

func (h *ContactHandler) HandleDeleteContact(c *fiber.Ctx) error {
	contactID := c.Params("id")
	user := h.securityContext.GetAuthenticatedUser(c)

	contact, err := h.repo.GetContactByID(contactID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, h.langContext.T(c, "contact_not_found"), err)
	}

	if err := h.repo.DeleteContactByIDAndCompanyID(contactID, *user.User.CompanyID); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_delete_contact"), err)
	}

	h.dispatcher.Dispatch(interfaces.EventTypeContactDeleted, &listeners.ContactDeletedPayload{
		Contact: contact,
		User:    user.User,
	})

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "contact_deleted"), nil)
}

func (h *ContactHandler) HandleCreateContactNote(c *fiber.Ctx) error {
	contactID := c.Params("id")
	user := h.securityContext.GetAuthenticatedUser(c)

	var input ContactNoteInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "bad_request"), err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	contactNote := models.ContactNote{
		Content:   input.Content,
		ContactID: contactID,
		UserID:    user.User.ID,
	}

	if err := h.repo.CreateContactNote(&contactNote); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_create_contact_note"), err)
	}

	contact, err := h.repo.GetContactByIDAndCompanyID(contactID, *user.User.CompanyID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, h.langContext.T(c, "contact_not_found"), err)
	}

	h.dispatcher.Dispatch(interfaces.EventTypeContactNoteCreated, &listeners.ContactNoteCreatedPayload{
		Contact: contact,
		User:    user.User,
		Note:    &contactNote,
	})

	return utils.SuccessResponse(c, fiber.StatusCreated, h.langContext.T(c, "contact_note_created"), contactNote.ToResponse())
}

func (h *ContactHandler) HandleListContactNotes(c *fiber.Ctx) error {
	contactID := c.Params("id")
	orderBy := "created_at DESC"
	contactNotes, err := h.repo.GetContactNotesByContactID(contactID, &orderBy)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_fetch_contact_notes"), err)
	}

	responses := make([]types.ContactNotePayload, len(contactNotes))
	for i, note := range contactNotes {
		responses[i] = note.ToResponse()
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "contact_notes_fetched"), responses)
}

func (h *ContactHandler) HandleGetContactConversations(c *fiber.Ctx) error {
	contactID := c.Params("id")

	conversations, err := h.conversationRepo.GetConversationsByContactID(contactID, "Inbox")

	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "failed_to_fetch_conversations"), err)
	}

	responses := make([]types.ConversationPayload, len(conversations))
	for i, conversation := range conversations {
		responses[i] = *conversation.ToPayload()
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "conversations_fetched"), responses)
}
