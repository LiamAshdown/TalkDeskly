package handler

import (
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/repositories"
	"live-chat-server/types"
	"live-chat-server/utils"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type InboxInput struct {
	Name           string   `json:"name" validate:"required,min=3,max=1000"`
	WelcomeMessage string   `json:"welcome_message" validate:"required,min=3,max=255"`
	Description    string   `json:"description" validate:"omitempty,min=3,max=1000"`
	UserIDs        []string `json:"user_ids"`
}

type CreateInboxInput struct {
	InboxInput
}

type UpdateInboxInput struct {
	InboxInput
	ID                    string                        `json:"id" validate:"required,uuid"`
	Enabled               bool                          `json:"enabled" validate:"required"`
	AutoAssignmentEnabled bool                          `json:"auto_assignment_enabled" validate:"omitempty"`
	MaxAutoAssignments    int                           `json:"max_auto_assignments" validate:"omitempty,min=1,max=100"`
	AutoResponderEnabled  bool                          `json:"auto_responder_enabled" validate:"omitempty"`
	AutoResponderMessage  string                        `json:"auto_responder_message" validate:"omitempty"`
	WorkingHours          map[string]types.WorkingHours `json:"working_hours" validate:"omitempty,working_hours"`
	OutsideHoursMessage   string                        `json:"outside_hours_message" validate:"omitempty"`
	WidgetCustomization   types.WidgetCustomization     `json:"widget_customization" validate:"required"`
}

type UserResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type InboxHandler struct {
	repo            repositories.InboxRepository
	userRepo        repositories.UserRepository
	securityContext interfaces.SecurityContext
	dispatcher      interfaces.Dispatcher
	logger          interfaces.Logger
	langContext     interfaces.LanguageContext
}

func NewInboxHandler(repo repositories.InboxRepository, userRepo repositories.UserRepository, securityContext interfaces.SecurityContext, dispatcher interfaces.Dispatcher, logger interfaces.Logger, langContext interfaces.LanguageContext) *InboxHandler {
	handlerLogger := logger.Named("inbox_handler")
	return &InboxHandler{
		repo:            repo,
		userRepo:        userRepo,
		securityContext: securityContext,
		dispatcher:      dispatcher,
		logger:          handlerLogger,
		langContext:     langContext,
	}
}

func (h *InboxHandler) HandleGetInbox(c *fiber.Ctx) error {
	inboxID := c.Params("id")
	user := h.securityContext.GetAuthenticatedUser(c)

	inbox, err := h.repo.GetInboxByIDAndCompanyID(inboxID, *user.User.CompanyID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, h.langContext.T(c, "inbox_not_found"), err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "inbox_found"), inbox.ToResponse())
}

func (h *InboxHandler) HandleListInboxes(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	inboxes, err := h.repo.GetInboxesByCompanyID(*user.User.CompanyID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_list_inboxes"), err)
	}

	responses := make([]interface{}, len(inboxes))
	for i, inbox := range inboxes {
		responses[i] = inbox.ToResponse()
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "inboxes_listed"), responses)
}

func (h *InboxHandler) HandleCreateInbox(c *fiber.Ctx) error {
	var input CreateInboxInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "bad_request"), err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	user := h.securityContext.GetAuthenticatedUser(c)

	users := []models.User{*user.User}

	inbox := models.Inbox{
		Name:           input.Name,
		CompanyID:      *user.User.CompanyID,
		WelcomeMessage: input.WelcomeMessage,
		Type:           models.InboxTypeWebChat,
		Users:          users,
	}

	// TODO; Implement different inbox types

	if err := h.repo.CreateInbox(&inbox); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_create_inbox"), err.Error())
	}

	h.dispatcher.Dispatch(interfaces.EventTypeInboxCreated, &inbox)

	return utils.SuccessResponse(c, fiber.StatusCreated, h.langContext.T(c, "inbox_created"), inbox.ToResponse())
}

func (h *InboxHandler) UpdateInboxUsers(tx *gorm.DB, inbox *models.Inbox, newUserIDs []string, companyID string) ([]string, error) {
	// Get current user IDs for comparison
	currentUserIDs := make(map[string]bool)
	for _, u := range inbox.Users {
		currentUserIDs[u.ID] = true
	}

	// Find users to be removed
	var removedUserIDs []string
	for userID := range currentUserIDs {
		stillExists := false
		for _, newUserID := range newUserIDs {
			if userID == newUserID {
				stillExists = true
				break
			}
		}
		if !stillExists {
			removedUserIDs = append(removedUserIDs, userID)
		}
	}

	// Fetch new users
	var users []models.User
	if len(newUserIDs) > 0 {
		if err := tx.Find(&users, newUserIDs).Where("company_id = ?", companyID).Error; err != nil {
			return nil, err
		}
	}

	// Update associations
	if err := tx.Model(inbox).Association("Users").Replace(users); err != nil {
		return nil, err
	}

	return removedUserIDs, nil
}

func (h *InboxHandler) HandleUpdateInbox(c *fiber.Ctx) error {
	var input UpdateInboxInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "bad_request"), err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	user := h.securityContext.GetAuthenticatedUser(c)

	inbox, err := h.repo.GetInboxByIDAndCompanyID(input.ID, *user.User.CompanyID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, h.langContext.T(c, "inbox_not_found"), err)
	}

	// Update inbox fields
	inbox.Name = input.Name
	inbox.WelcomeMessage = input.WelcomeMessage
	inbox.Description = input.Description
	inbox.Enabled = input.Enabled
	inbox.AutoAssignmentEnabled = input.AutoAssignmentEnabled
	inbox.MaxAutoAssignments = input.MaxAutoAssignments
	inbox.AutoResponderEnabled = input.AutoResponderEnabled
	inbox.AutoResponderMessage = input.AutoResponderMessage
	inbox.WorkingHours = input.WorkingHours
	inbox.OutsideHoursMessage = input.OutsideHoursMessage
	inbox.WidgetCustomization = input.WidgetCustomization

	// Update user associations and save inbox in a single transaction
	var removedUserIDs []string
	if err := models.DB.Transaction(func(tx *gorm.DB) error {
		var err error
		removedUserIDs, err = h.UpdateInboxUsers(tx, inbox, input.UserIDs, *user.User.CompanyID)
		if err != nil {
			return err
		}
		return tx.Save(inbox).Error
	}); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_update_inbox"), err)
	}

	h.dispatcher.Dispatch(interfaces.EventTypeInboxUpdated, &types.InboxUpdatedPayload{
		Inbox:          &inbox,
		RemovedUserIDs: removedUserIDs,
	})

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "inbox_updated"), inbox.ToResponse())
}

func (h *InboxHandler) HandleDeleteInbox(c *fiber.Ctx) error {
	inboxID := c.Params("id")
	user := h.securityContext.GetAuthenticatedUser(c)

	if err := h.repo.DeleteInboxByIDAndCompanyID(inboxID, *user.User.CompanyID); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_delete_inbox"), err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "inbox_deleted"), nil)
}

func (h *InboxHandler) HandleUpdateInboxUsers(c *fiber.Ctx) error {
	inboxID := c.Params("id")
	user := h.securityContext.GetAuthenticatedUser(c)

	var input struct {
		AgentIDs []string `json:"agent_ids"`
	}
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "bad_request"), err)
	}

	// Ensure current user is always included and get unique IDs
	input.AgentIDs = append(input.AgentIDs, user.User.ID)
	input.AgentIDs = utils.Unique(input.AgentIDs)

	var inbox *models.Inbox
	var removedUserIDs []string

	// Update users in a single transaction
	if err := models.DB.Transaction(func(tx *gorm.DB) error {
		// Fetch inbox
		var err error
		inbox, err = h.repo.GetInboxByIDAndCompanyID(inboxID, *user.User.CompanyID)
		if err != nil {
			return err
		}

		removedUserIDs, err = h.UpdateInboxUsers(tx, inbox, input.AgentIDs, *user.User.CompanyID)
		return err
	}); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_update_inbox_users"), err)
	}

	// Reload inbox with users
	var err error
	inbox, err = h.repo.GetInboxByID(inboxID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_reload_inbox"), err)
	}

	h.dispatcher.Dispatch(interfaces.EventTypeInboxUpdated, map[string]interface{}{
		"inbox":            inbox.ToResponse(),
		"removed_user_ids": removedUserIDs,
	})

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "inbox_users_updated"), inbox.ToResponse())
}
