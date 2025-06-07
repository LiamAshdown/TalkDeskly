package handler

import (
	"live-chat-server/interfaces"
	"live-chat-server/services"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

type AnalyticsHandler struct {
	analyticsService services.AnalyticsService
	securityContext  interfaces.SecurityContext
	responseFactory  interfaces.ResponseFactory
}

func NewAnalyticsHandler(analyticsService services.AnalyticsService, securityContext interfaces.SecurityContext, responseFactory interfaces.ResponseFactory) *AnalyticsHandler {
	return &AnalyticsHandler{
		analyticsService: analyticsService,
		securityContext:  securityContext,
		responseFactory:  responseFactory,
	}
}

// HandleGetAnalyticsDashboard gets comprehensive analytics data for a time period
func (h *AnalyticsHandler) HandleGetAnalyticsDashboard(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	// Get days parameter (default to 7 days)
	daysStr := c.Query("days", "7")
	days, err := strconv.Atoi(daysStr)
	if err != nil || days <= 0 {
		days = 7
	}

	// Maximum 365 days for performance
	if days > 365 {
		days = 365
	}

	dashboard, err := h.analyticsService.GetAnalyticsDashboard(*user.User.CompanyID, days)
	if err != nil {
		return h.responseFactory.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to fetch analytics data", err)
	}

	return h.responseFactory.SuccessResponse(c, fiber.StatusOK, "Analytics data fetched successfully", dashboard)
}

// HandleGetConversationStats gets conversation statistics for a date range
func (h *AnalyticsHandler) HandleGetConversationStats(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	startDate, endDate, err := parseDateRange(c)
	if err != nil {
		return h.responseFactory.ErrorResponse(c, fiber.StatusBadRequest, "Failed to parse date range", err)
	}

	stats, err := h.analyticsService.GetConversationStats(*user.User.CompanyID, startDate, endDate)
	if err != nil {
		return h.responseFactory.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to fetch conversation statistics", err)
	}

	return h.responseFactory.SuccessResponse(c, fiber.StatusOK, "Conversation statistics fetched successfully", stats)
}

// HandleGetAgentStats gets agent performance statistics
func (h *AnalyticsHandler) HandleGetAgentStats(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	startDate, endDate, err := parseDateRange(c)
	if err != nil {
		return h.responseFactory.ErrorResponse(c, fiber.StatusBadRequest, "Failed to parse date range", err)
	}

	stats, err := h.analyticsService.GetConversationsByAgent(*user.User.CompanyID, startDate, endDate)
	if err != nil {
		return h.responseFactory.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to fetch agent statistics", err)
	}

	return h.responseFactory.SuccessResponse(c, fiber.StatusOK, "Agent statistics fetched successfully", stats)
}

// HandleGetMessageStats gets message statistics
func (h *AnalyticsHandler) HandleGetMessageStats(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	startDate, endDate, err := parseDateRange(c)
	if err != nil {
		return h.responseFactory.ErrorResponse(c, fiber.StatusBadRequest, "Failed to parse date range", err)
	}

	stats, err := h.analyticsService.GetMessageStats(*user.User.CompanyID, startDate, endDate)
	if err != nil {
		return h.responseFactory.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to fetch message statistics", err)
	}

	return h.responseFactory.SuccessResponse(c, fiber.StatusOK, "Message statistics fetched successfully", stats)
}

// HandleGetStatusStats gets conversation status statistics
func (h *AnalyticsHandler) HandleGetStatusStats(c *fiber.Ctx) error {
	user := h.securityContext.GetAuthenticatedUser(c)

	startDate, endDate, err := parseDateRange(c)
	if err != nil {
		return h.responseFactory.ErrorResponse(c, fiber.StatusBadRequest, "Failed to parse date range", err)
	}

	stats, err := h.analyticsService.GetConversationStatusStats(*user.User.CompanyID, startDate, endDate)
	if err != nil {
		return h.responseFactory.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to fetch status statistics", err)
	}

	return h.responseFactory.SuccessResponse(c, fiber.StatusOK, "Status statistics fetched successfully", stats)
}

// parseDateRange parses start_date and end_date from query parameters
// Returns default range of last 7 days if not provided
func parseDateRange(c *fiber.Ctx) (time.Time, time.Time, error) {
	now := time.Now()

	// Default to last 7 days
	defaultStart := now.AddDate(0, 0, -7)
	defaultEnd := now

	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	var startDate, endDate time.Time
	var err error

	if startDateStr != "" {
		startDate, err = time.Parse("2006-01-02", startDateStr)
		if err != nil {
			return time.Time{}, time.Time{}, err
		}
	} else {
		startDate = defaultStart
	}

	if endDateStr != "" {
		endDate, err = time.Parse("2006-01-02", endDateStr)
		if err != nil {
			return time.Time{}, time.Time{}, err
		}
	} else {
		endDate = defaultEnd
	}

	// Ensure end date is not before start date
	if endDate.Before(startDate) {
		return time.Time{}, time.Time{}, fiber.NewError(fiber.StatusBadRequest, "End date cannot be before start date")
	}

	return startDate, endDate, nil
}
