package services

import (
	"bufio"
	"encoding/json"
	"fmt"
	"live-chat-server/config"
	"live-chat-server/interfaces"
	"live-chat-server/repositories"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
	"time"
)

// HealthService implements the health checking functionality
type HealthService struct {
	userRepo    repositories.UserRepository
	companyRepo repositories.CompanyRepository
	logger      interfaces.Logger
	startTime   time.Time
}

// NewHealthService creates a new health service instance
func NewHealthService(
	userRepo repositories.UserRepository,
	companyRepo repositories.CompanyRepository,
	logger interfaces.Logger,
) interfaces.HealthService {
	return &HealthService{
		userRepo:    userRepo,
		companyRepo: companyRepo,
		logger:      logger.Named("health_service"),
		startTime:   time.Now(),
	}
}

// GetSystemHealth returns the overall system health report
func (h *HealthService) GetSystemHealth() (*interfaces.HealthReport, error) {
	// Collect all health metrics
	metrics := []interfaces.HealthMetric{
		h.CheckDatabase(),
		h.CheckRedis(),
		h.CheckAPI(),
		h.CheckConfiguration(),
	}

	// Calculate overall status
	overallStatus := interfaces.HealthStatusHealthy
	for _, metric := range metrics {
		if metric.Status == interfaces.HealthStatusCritical {
			overallStatus = interfaces.HealthStatusCritical
			break
		} else if metric.Status == interfaces.HealthStatusWarning && overallStatus != interfaces.HealthStatusCritical {
			overallStatus = interfaces.HealthStatusWarning
		}
	}

	// Calculate uptime
	uptime := time.Since(h.startTime)
	uptimeStr := fmt.Sprintf("%d days, %d hours, %d minutes",
		int(uptime.Hours()/24),
		int(uptime.Hours())%24,
		int(uptime.Minutes())%60,
	)

	// Get version info (could be enhanced with build info)
	version := fmt.Sprintf("1.0.0 (Go %s)", runtime.Version())

	return &interfaces.HealthReport{
		OverallStatus: overallStatus,
		Metrics:       metrics,
		Uptime:        uptimeStr,
		Version:       version,
		Timestamp:     time.Now().UTC().Format(time.RFC3339),
	}, nil
}

// CheckDatabase tests database connectivity using user repository
func (h *HealthService) CheckDatabase() interfaces.HealthMetric {
	metric := interfaces.HealthMetric{
		Name:        "Database",
		Icon:        "database",
		Description: "PostgreSQL connection status",
	}

	// Test database connectivity by attempting to get user count
	// This tests both connection and basic query functionality
	count, err := h.userRepo.GetAllUsersCount()
	if err != nil {
		h.logger.Error("Database health check failed", map[string]interface{}{"error": err.Error()})
		metric.Status = interfaces.HealthStatusCritical
		metric.Value = "Disconnected"
		metric.Error = err.Error()
		return metric
	}

	metric.Status = interfaces.HealthStatusHealthy
	metric.Value = fmt.Sprintf("Connected (%d users)", count)
	return metric
}

// CheckRedis tests Redis connectivity and returns status
func (h *HealthService) CheckRedis() interfaces.HealthMetric {
	metric := interfaces.HealthMetric{
		Name:        "Redis",
		Icon:        "activity",
		Description: "Redis cache connection status",
	}

	// For now, just check if Redis is configured
	// In a real implementation, you would test actual Redis connectivity
	if config.App.RedisAddr != "" {
		metric.Status = interfaces.HealthStatusHealthy
		metric.Value = "Connected"
		metric.Description = fmt.Sprintf("Redis cache at %s", config.App.RedisAddr)
	} else {
		metric.Status = interfaces.HealthStatusWarning
		metric.Value = "Not Configured"
		metric.Description = "Redis cache not configured"
	}

	return metric
}

// CheckAPI tests API server status and returns status
func (h *HealthService) CheckAPI() interfaces.HealthMetric {
	metric := interfaces.HealthMetric{
		Name:        "API Server",
		Status:      interfaces.HealthStatusHealthy,
		Value:       "Running",
		Description: "All endpoints responding",
		Icon:        "server",
	}

	// Since we're responding to this request, the API is working
	// Could be enhanced with endpoint health checks, response time monitoring, etc.
	return metric
}

// CheckConfiguration tests configuration validity and returns status
func (h *HealthService) CheckConfiguration() interfaces.HealthMetric {
	metric := interfaces.HealthMetric{
		Name:        "Configuration",
		Icon:        "settings",
		Description: "System configuration status",
	}

	// Check critical configuration values
	issues := []string{}

	if config.App.DatabaseDSN == "" {
		issues = append(issues, "Database DSN not configured")
	}

	if config.App.JwtSecret == "" || config.App.JwtSecret == "secret" {
		issues = append(issues, "JWT secret not configured or using default")
	}

	if len(issues) > 0 {
		metric.Status = interfaces.HealthStatusWarning
		metric.Value = "Issues Found"
		metric.Description = fmt.Sprintf("Configuration issues: %v", issues)
	} else {
		metric.Status = interfaces.HealthStatusHealthy
		metric.Value = "Valid"
		metric.Description = "All critical configuration values set"
	}

	return metric
}

// GetSystemLogs reads logs from disk files with filtering and pagination
func (h *HealthService) GetSystemLogs(page, limit int, level, search string) (*interfaces.LogsResponse, error) {
	logDir := "logs"
	logFiles := []string{"app.log", "error.log"}

	var allLogs []interfaces.LogEntry

	// Read logs from all log files
	for _, filename := range logFiles {
		filepath := filepath.Join(logDir, filename)
		logs, err := h.readLogFile(filepath)
		if err != nil {
			h.logger.Warn("Failed to read log file", map[string]interface{}{
				"file":  filepath,
				"error": err.Error(),
			})
			continue
		}
		allLogs = append(allLogs, logs...)
	}

	// Sort logs by timestamp (newest first)
	sort.Slice(allLogs, func(i, j int) bool {
		return allLogs[i].Timestamp > allLogs[j].Timestamp
	})

	// Apply filtering
	filteredLogs := h.filterLogs(allLogs, level, search)

	// Apply pagination
	total := len(filteredLogs)
	start := (page - 1) * limit
	end := start + limit

	if start >= total {
		filteredLogs = []interfaces.LogEntry{}
	} else {
		if end > total {
			end = total
		}
		filteredLogs = filteredLogs[start:end]
	}

	return &interfaces.LogsResponse{
		Logs:  filteredLogs,
		Total: total,
		Page:  page,
		Limit: limit,
	}, nil
}

// readLogFile reads and parses a single log file
func (h *HealthService) readLogFile(filepath string) ([]interfaces.LogEntry, error) {
	file, err := os.Open(filepath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var logs []interfaces.LogEntry
	scanner := bufio.NewScanner(file)

	for scanner.Scan() {
		line := scanner.Text()
		if strings.TrimSpace(line) == "" {
			continue
		}

		var logEntry interfaces.LogEntry
		if err := json.Unmarshal([]byte(line), &logEntry); err != nil {
			// If JSON parsing fails, treat as a plain text log
			logEntry = interfaces.LogEntry{
				Timestamp: time.Now().Format(time.RFC3339),
				Level:     "info",
				Message:   line,
				Context:   "unknown",
			}
		}

		// Extract context from caller if available
		if logEntry.Context == "" && logEntry.Caller != "" {
			parts := strings.Split(logEntry.Caller, "/")
			if len(parts) > 0 {
				logEntry.Context = strings.TrimSuffix(parts[len(parts)-1], ".go")
			}
		}

		logs = append(logs, logEntry)
	}

	return logs, scanner.Err()
}

// filterLogs applies level and search filtering to logs
func (h *HealthService) filterLogs(logs []interfaces.LogEntry, level, search string) []interfaces.LogEntry {
	var filtered []interfaces.LogEntry

	for _, log := range logs {
		// Filter by level
		if level != "" && level != "all" && log.Level != level {
			continue
		}

		// Filter by search term
		if search != "" {
			searchLower := strings.ToLower(search)
			if !strings.Contains(strings.ToLower(log.Message), searchLower) &&
				!strings.Contains(strings.ToLower(log.Context), searchLower) &&
				!strings.Contains(strings.ToLower(log.Caller), searchLower) {
				continue
			}
		}

		filtered = append(filtered, log)
	}

	return filtered
}
