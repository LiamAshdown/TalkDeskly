package handler

import (
	"live-chat-server/interfaces"
	"live-chat-server/utils"

	"github.com/gofiber/fiber/v2"
)

type HealthHandler struct {
	healthService interfaces.HealthService
	logger        interfaces.Logger
}

func NewHealthHandler(
	healthService interfaces.HealthService,
	logger interfaces.Logger,
) *HealthHandler {
	return &HealthHandler{
		healthService: healthService,
		logger:        logger.Named("health_handler"),
	}
}

// GetHealth returns basic health status for public monitoring
func (h *HealthHandler) GetHealth(c *fiber.Ctx) error {
	// Get system health from the health service
	healthReport, err := h.healthService.GetSystemHealth()
	if err != nil {
		h.logger.Error("Failed to get system health", map[string]interface{}{"error": err.Error()})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "health_check_failed",
			"Health check failed")
	}

	// Return a simplified response for public consumption
	response := fiber.Map{
		"status":    healthReport.OverallStatus,
		"timestamp": healthReport.Timestamp,
		"version":   healthReport.Version,
		"uptime":    healthReport.Uptime,
	}

	// Set appropriate HTTP status based on health
	statusCode := fiber.StatusOK
	if healthReport.OverallStatus == "critical" {
		statusCode = fiber.StatusServiceUnavailable
	} else if healthReport.OverallStatus == "warning" {
		statusCode = fiber.StatusOK // Still OK, but with warnings
	}

	return utils.SuccessResponse(c, statusCode, "health_check_completed", response)
}

// GetHealthDetailed returns detailed health metrics (useful for internal monitoring)
func (h *HealthHandler) GetHealthDetailed(c *fiber.Ctx) error {
	// Get complete system health from the health service
	healthReport, err := h.healthService.GetSystemHealth()
	if err != nil {
		h.logger.Error("Failed to get detailed system health", map[string]interface{}{"error": err.Error()})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "health_check_failed",
			"Detailed health check failed")
	}

	// Return the full health report
	statusCode := fiber.StatusOK
	if healthReport.OverallStatus == "critical" {
		statusCode = fiber.StatusServiceUnavailable
	}

	return utils.SuccessResponse(c, statusCode, "detailed_health_retrieved", healthReport)
}
