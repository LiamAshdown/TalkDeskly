package handler

import (
	"live-chat-server/interfaces"
	"live-chat-server/middleware"
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
	repo       repositories.ContactRepository
	dispatcher interfaces.Dispatcher
}

func NewContactHandler(repo repositories.ContactRepository, dispatcher interfaces.Dispatcher) *ContactHandler {
	return &ContactHandler{repo: repo, dispatcher: dispatcher}
}

func (h *ContactHandler) HandleGetContact(c *fiber.Ctx) error {
	contactID := c.Params("id")
	user := middleware.GetAuthUser(c)

	contact, err := h.repo.GetContactByIDAndCompanyID(contactID, *user.User.CompanyID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "contact_not_found", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "contact_found", contact.ToResponse())
}

func (h *ContactHandler) HandleListContacts(c *fiber.Ctx) error {
	user := middleware.GetAuthUser(c)

	contacts, err := h.repo.GetContactsByCompanyID(*user.User.CompanyID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_fetch_contacts", err)
	}

	responses := make([]interface{}, len(contacts))
	for i, contact := range contacts {
		responses[i] = contact.ToResponse()
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "contacts_fetched", responses)
}

func (h *ContactHandler) HandleCreateContact(c *fiber.Ctx) error {
	var input ContactInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "bad_request", err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	user := middleware.GetAuthUser(c)

	contact := models.Contact{
		Name:      input.Name,
		Email:     input.Email,
		Phone:     input.Phone,
		Company:   input.Company,
		CompanyID: *user.User.CompanyID,
	}

	if err := h.repo.CreateContact(&contact); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_create_contact", err)
	}

	h.dispatcher.Dispatch(interfaces.EventTypeContactCreated, &contact)

	return utils.SuccessResponse(c, fiber.StatusCreated, "contact_created", contact.ToResponse())
}

func (h *ContactHandler) HandleUpdateContact(c *fiber.Ctx) error {
	contactID := c.Params("id")
	user := middleware.GetAuthUser(c)

	var input ContactInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "bad_request", err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	contact, err := h.repo.GetContactByIDAndCompanyID(contactID, *user.User.CompanyID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "contact_not_found", err)
	}

	contact.Name = input.Name
	contact.Email = input.Email
	contact.Phone = input.Phone
	contact.Company = input.Company

	if err := h.repo.UpdateContact(contact); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_update_contact", err)
	}

	h.dispatcher.Dispatch(interfaces.EventTypeContactUpdated, &contact)

	return utils.SuccessResponse(c, fiber.StatusOK, "contact_updated", contact.ToResponse())
}

func (h *ContactHandler) HandleDeleteContact(c *fiber.Ctx) error {
	contactID := c.Params("id")
	user := middleware.GetAuthUser(c)

	contact, err := h.repo.GetContactByID(contactID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "contact_not_found", err)
	}

	if err := h.repo.DeleteContactByIDAndCompanyID(contactID, *user.User.CompanyID); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_delete_contact", err)
	}

	h.dispatcher.Dispatch(interfaces.EventTypeContactDeleted, &contact)

	return utils.SuccessResponse(c, fiber.StatusOK, "contact_deleted", nil)
}

func (h *ContactHandler) HandleCreateContactNote(c *fiber.Ctx) error {
	contactID := c.Params("id")
	user := middleware.GetAuthUser(c)

	var input ContactNoteInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "bad_request", err)
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
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_create_contact_note", err)
	}

	h.dispatcher.Dispatch(interfaces.EventTypeContactNoteCreated, map[string]interface{}{
		"note":     contactNote.ToResponse(),
		"companyID":  *user.User.CompanyID,
	})

	return utils.SuccessResponse(c, fiber.StatusCreated, "contact_note_created", contactNote.ToResponse())
}

func (h *ContactHandler) HandleListContactNotes(c *fiber.Ctx) error {
	contactID := c.Params("id")
	orderBy := "created_at DESC"
	contactNotes, err := h.repo.GetContactNotesByContactID(contactID, &orderBy)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_fetch_contact_notes", err)
	}

	responses := make([]types.ContactNotePayload, len(contactNotes))
	for i, note := range contactNotes {
		responses[i] = note.ToResponse()
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "contact_notes_fetched", responses)
}
