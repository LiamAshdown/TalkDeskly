package interfaces

// HealthStatus represents the health status of a component
type HealthStatus string

const (
	HealthStatusHealthy  HealthStatus = "healthy"
	HealthStatusWarning  HealthStatus = "warning"
	HealthStatusCritical HealthStatus = "critical"
)

// HealthMetric represents a single health metric
type HealthMetric struct {
	Name        string       `json:"name"`
	Status      HealthStatus `json:"status"`
	Value       string       `json:"value"`
	Description string       `json:"description"`
	Icon        string       `json:"icon"`
	Error       string       `json:"error,omitempty"`
}

// HealthReport represents the overall system health
type HealthReport struct {
	OverallStatus HealthStatus   `json:"overall_status"`
	Metrics       []HealthMetric `json:"metrics"`
	Uptime        string         `json:"uptime"`
	Version       string         `json:"version"`
	Timestamp     string         `json:"timestamp"`
}

// LogEntry represents a parsed log entry
type LogEntry struct {
	Timestamp string `json:"ts"`
	Level     string `json:"level"`
	Message   string `json:"msg"`
	Caller    string `json:"caller,omitempty"`
	Context   string `json:"context,omitempty"`
}

// LogsResponse represents the response for log queries
type LogsResponse struct {
	Logs  []LogEntry `json:"logs"`
	Total int        `json:"total"`
	Page  int        `json:"page"`
	Limit int        `json:"limit"`
}

// HealthService defines the interface for health checking functionality
type HealthService interface {
	// GetSystemHealth returns the overall system health report
	GetSystemHealth() (*HealthReport, error)

	// CheckDatabase tests database connectivity and returns status
	CheckDatabase() HealthMetric

	// CheckRedis tests Redis connectivity and returns status
	CheckRedis() HealthMetric

	// CheckAPI tests API server status and returns status
	CheckAPI() HealthMetric

	// CheckConfiguration tests configuration validity and returns status
	CheckConfiguration() HealthMetric

	// GetSystemLogs reads logs from disk files with filtering and pagination
	GetSystemLogs(page, limit int, level, search string) (*LogsResponse, error)
}
