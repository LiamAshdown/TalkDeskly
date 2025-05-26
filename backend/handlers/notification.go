package handler

import (
	"live-chat-server/interfaces"
	"live-chat-server/repositories"
	"live-chat-server/utils"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type NotificationListResponse struct {
	Notifications []interface{} `json:"notifications"`
	Total         int64         `json:"total"`
	UnreadCount   int64         `json:"unread_count"`
	Page          int           `json:"page"`
	Limit         int           `json:"limit"`
}

type MarkAsReadInput struct {
	NotificationIDs []string `json:"notification_ids" validate:"required"`
}

type NotificationHandler struct {
	notificationRepo repositories.NotificationRepository
	securityContext  interfaces.SecurityContext
	logger           interfaces.Logger
	langContext      interfaces.LanguageContext
}

func NewNotificationHandler(
	notificationRepo repositories.NotificationRepository,
	securityContext interfaces.SecurityContext,
	logger interfaces.Logger,
	langContext interfaces.LanguageContext,
) *NotificationHandler {
	handlerLogger := logger.Named("notification_handler")

	return &NotificationHandler{
		notificationRepo: notificationRepo,
		securityContext:  securityContext,
		logger:           handlerLogger,
		langContext:      langContext,
	}
}

// GetNotifications retrieves paginated notifications for the authenticated user
func (h *NotificationHandler) GetNotifications(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	// Parse query parameters
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	unreadOnly := c.Query("unread_only", "false") == "true"

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	offset := (page - 1) * limit

	// Get total count
	total, err := h.notificationRepo.GetNotificationCount(user.User.ID, unreadOnly)
	if err != nil {
		h.logger.Error("Failed to count notifications", fiber.Map{
			"user_id": user.User.ID,
			"error":   err.Error(),
		})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_fetch_notifications"), err)
	}

	// Get unread count
	unreadCount, err := h.notificationRepo.GetUnreadCount(user.User.ID)
	if err != nil {
		h.logger.Error("Failed to count unread notifications", fiber.Map{
			"user_id": user.User.ID,
			"error":   err.Error(),
		})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_fetch_notifications"), err)
	}

	// Get notifications
	notifications, err := h.notificationRepo.GetNotificationsByUserID(user.User.ID, limit, offset, unreadOnly)
	if err != nil {
		h.logger.Error("Failed to fetch notifications", fiber.Map{
			"user_id": user.User.ID,
			"error":   err.Error(),
		})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_fetch_notifications"), err)
	}

	// Convert to response format
	var notificationResponses []interface{}
	for _, notification := range notifications {
		notificationResponses = append(notificationResponses, notification.ToResponse())
	}

	response := NotificationListResponse{
		Notifications: notificationResponses,
		Total:         total,
		UnreadCount:   unreadCount,
		Page:          page,
		Limit:         limit,
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "notifications_found"), response)
}

// GetNotification retrieves a single notification by ID
func (h *NotificationHandler) GetNotification(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)
	notificationID := c.Params("id")

	notification, err := h.notificationRepo.GetNotificationByID(notificationID, user.User.ID)
	if err != nil {
		h.logger.Error("Notification not found", fiber.Map{
			"notification_id": notificationID,
			"user_id":         user.User.ID,
			"error":           err.Error(),
		})
		return utils.ErrorResponse(c, fiber.StatusNotFound, h.langContext.T(c, "notification_not_found"), err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "notification_found"), notification.ToResponse())
}

// MarkAsRead marks one or more notifications as read
func (h *NotificationHandler) MarkAsRead(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	var input MarkAsReadInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, h.langContext.T(c, "bad_request"), err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	// Update notifications
	affectedCount, err := h.notificationRepo.MarkAsRead(input.NotificationIDs, user.User.ID)
	if err != nil {
		h.logger.Error("Failed to mark notifications as read", fiber.Map{
			"notification_ids": input.NotificationIDs,
			"user_id":          user.User.ID,
			"error":            err.Error(),
		})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_update_notifications"), err)
	}

	h.logger.Info("Notifications marked as read", fiber.Map{
		"notification_ids": input.NotificationIDs,
		"user_id":          user.User.ID,
		"affected_rows":    affectedCount,
	})

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "notifications_marked_as_read"), fiber.Map{
		"affected_count": affectedCount,
	})
}

// MarkAllAsRead marks all notifications as read for the authenticated user
func (h *NotificationHandler) MarkAllAsRead(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	affectedCount, err := h.notificationRepo.MarkAllAsRead(user.User.ID)
	if err != nil {
		h.logger.Error("Failed to mark all notifications as read", fiber.Map{
			"user_id": user.User.ID,
			"error":   err.Error(),
		})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_update_notifications"), err)
	}

	h.logger.Info("All notifications marked as read", fiber.Map{
		"user_id":       user.User.ID,
		"affected_rows": affectedCount,
	})

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "all_notifications_marked_as_read"), fiber.Map{
		"affected_count": affectedCount,
	})
}

// DeleteNotification deletes a specific notification
func (h *NotificationHandler) DeleteNotification(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)
	notificationID := c.Params("id")

	affectedCount, err := h.notificationRepo.DeleteNotification(notificationID, user.User.ID)
	if err != nil {
		h.logger.Error("Failed to delete notification", fiber.Map{
			"notification_id": notificationID,
			"user_id":         user.User.ID,
			"error":           err.Error(),
		})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_delete_notification"), err)
	}

	if affectedCount == 0 {
		return utils.ErrorResponse(c, fiber.StatusNotFound, h.langContext.T(c, "notification_not_found"), nil)
	}

	h.logger.Info("Notification deleted", fiber.Map{
		"notification_id": notificationID,
		"user_id":         user.User.ID,
	})

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "notification_deleted"), nil)
}

// DeleteAllNotifications deletes all notifications for the authenticated user
func (h *NotificationHandler) DeleteAllNotifications(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	affectedCount, err := h.notificationRepo.DeleteAllNotifications(user.User.ID)
	if err != nil {
		h.logger.Error("Failed to delete all notifications", fiber.Map{
			"user_id": user.User.ID,
			"error":   err.Error(),
		})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_delete_notifications"), err)
	}

	h.logger.Info("All notifications deleted", fiber.Map{
		"user_id":       user.User.ID,
		"affected_rows": affectedCount,
	})

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "all_notifications_deleted"), fiber.Map{
		"affected_count": affectedCount,
	})
}

// GetUnreadCount returns the count of unread notifications for the authenticated user
func (h *NotificationHandler) GetUnreadCount(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	count, err := h.notificationRepo.GetUnreadCount(user.User.ID)
	if err != nil {
		h.logger.Error("Failed to count unread notifications", fiber.Map{
			"user_id": user.User.ID,
			"error":   err.Error(),
		})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, h.langContext.T(c, "failed_to_fetch_notifications"), err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, h.langContext.T(c, "unread_count_found"), fiber.Map{
		"unread_count": count,
	})
}
