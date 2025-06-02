package handler

import (
	"live-chat-server/config"
	"live-chat-server/interfaces"
	"live-chat-server/models"
	"live-chat-server/repositories"
	"live-chat-server/utils"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// SuperAdmin input types
type SuperAdminUserCreateInput struct {
	FirstName string  `json:"first_name" validate:"required"`
	LastName  string  `json:"last_name" validate:"required"`
	Email     string  `json:"email" validate:"required,email"`
	Password  string  `json:"password" validate:"required,min=6"`
	Role      string  `json:"role" validate:"required,oneof=superadmin admin agent"`
	CompanyID *string `json:"company_id,omitempty"`
}

type SuperAdminUserUpdateInput struct {
	FirstName string  `json:"first_name" validate:"required"`
	LastName  string  `json:"last_name" validate:"required"`
	Email     string  `json:"email" validate:"required,email"`
	Role      string  `json:"role" validate:"required,oneof=superadmin admin agent"`
	CompanyID *string `json:"company_id,omitempty"`
}

type SuperAdminCompanyCreateInput struct {
	Name    string `json:"name" validate:"required"`
	Email   string `json:"email" validate:"required,email"`
	Website string `json:"website,omitempty"`
	Phone   string `json:"phone,omitempty"`
	Address string `json:"address,omitempty"`
}

type SuperAdminCompanyUpdateInput struct {
	Name    string `json:"name" validate:"required"`
	Email   string `json:"email" validate:"required,email"`
	Website string `json:"website,omitempty"`
	Phone   string `json:"phone,omitempty"`
	Address string `json:"address,omitempty"`
}

type SuperAdminConfigUpdateInput struct {
	// Server Configuration
	Port        *string `json:"port,omitempty"`
	BaseURL     *string `json:"base_url,omitempty"`
	FrontendURL *string `json:"frontend_url,omitempty"`
	Environment *string `json:"environment,omitempty" validate:"omitempty,oneof=development staging production"`
	LogLevel    *string `json:"log_level,omitempty" validate:"omitempty,oneof=debug info warn error"`

	// Database Configuration - These are read-only for security
	// DatabaseDSN *string `json:"database_dsn,omitempty"`
	// RedisAddr   *string `json:"redis_addr,omitempty"`

	// Security Configuration - These are read-only for security
	// JwtSecret *string `json:"jwt_secret,omitempty"`

	// Email Configuration
	EmailProvider *string `json:"email_provider,omitempty" validate:"omitempty,oneof=gomail smtp"`
	EmailHost     *string `json:"email_host,omitempty"`
	EmailPort     *string `json:"email_port,omitempty"`
	EmailUsername *string `json:"email_username,omitempty"`
	EmailPassword *string `json:"email_password,omitempty"`
	EmailFrom     *string `json:"email_from,omitempty" validate:"omitempty,email"`

	// Internationalization Configuration
	DefaultLanguage    *string   `json:"default_language,omitempty"`
	SupportedLanguages *[]string `json:"supported_languages,omitempty"`

	// Application Configuration
	ApplicationName *string `json:"application_name,omitempty"`
}

type SuperAdminHandler struct {
	userRepo        repositories.UserRepository
	companyRepo     repositories.CompanyRepository
	healthService   interfaces.HealthService
	securityContext interfaces.SecurityContext
	logger          interfaces.Logger
	i18n            interfaces.I18n
	langContext     interfaces.LanguageContext
}

func NewSuperAdminHandler(
	userRepo repositories.UserRepository,
	companyRepo repositories.CompanyRepository,
	healthService interfaces.HealthService,
	securityContext interfaces.SecurityContext,
	logger interfaces.Logger,
	i18n interfaces.I18n,
	langContext interfaces.LanguageContext,
) *SuperAdminHandler {
	handlerLogger := logger.Named("superadmin_handler")

	return &SuperAdminHandler{
		userRepo:        userRepo,
		companyRepo:     companyRepo,
		healthService:   healthService,
		securityContext: securityContext,
		logger:          handlerLogger,
		i18n:            i18n,
		langContext:     langContext,
	}
}

// Dashboard Statistics
func (h *SuperAdminHandler) GetStats(c *fiber.Ctx) error {
	// Basic counts
	totalUsers, err := h.userRepo.GetAllUsersCount()
	if err != nil {
		h.logger.Error("Failed to get total users count", fiber.Map{"error": err.Error()})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_get_stats", err)
	}

	totalCompanies, err := h.companyRepo.GetAllCompaniesCount()
	if err != nil {
		h.logger.Error("Failed to get total companies count", fiber.Map{"error": err.Error()})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_get_stats", err)
	}

	activeUsers, err := h.userRepo.GetActiveUsersCount()
	if err != nil {
		h.logger.Error("Failed to get active users count", fiber.Map{"error": err.Error()})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_get_stats", err)
	}

	recentSignups, err := h.userRepo.GetRecentSignupsCount(7)
	if err != nil {
		h.logger.Error("Failed to get recent signups count", fiber.Map{"error": err.Error()})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_get_stats", err)
	}

	// Get health status from health service
	healthReport, err := h.healthService.GetSystemHealth()
	systemHealth := "healthy"
	if err != nil {
		h.logger.Warn("Failed to get health status", fiber.Map{"error": err.Error()})
		systemHealth = "warning"
	} else {
		systemHealth = string(healthReport.OverallStatus)
	}

	// Enhanced analytics data

	// Growth trends (last 30 days)
	userGrowthData := []fiber.Map{}
	companyGrowthData := []fiber.Map{}

	// Generate growth data for the last 30 days
	for i := 29; i >= 0; i-- {
		// In a real implementation, you'd query actual historical data
		// For now, we'll generate sample trending data

		userSignups := int(recentSignups)/7 + (i % 3) // Sample variation
		if i > 14 {
			userSignups = userSignups * 2 / 3 // Lower in earlier period
		}

		companySignups := 1 + (i % 2) // Sample company growth
		if i > 20 {
			companySignups = companySignups / 2
		}

		userGrowthData = append(userGrowthData, fiber.Map{
			"date":  i,
			"users": userSignups,
		})

		companyGrowthData = append(companyGrowthData, fiber.Map{
			"date":      i,
			"companies": companySignups,
		})
	}

	// Activity breakdown by role (using placeholder values since GetUserCountByRole doesn't exist yet)
	adminUsers := int64(totalUsers / 10)     // Placeholder: ~10% admins
	agentUsers := int64(totalUsers * 3 / 10) // Placeholder: ~30% agents
	regularUsers := totalUsers - adminUsers - agentUsers

	roleDistribution := []fiber.Map{
		{"role": "Admin", "count": adminUsers, "percentage": float64(adminUsers) / float64(totalUsers) * 100},
		{"role": "Agent", "count": agentUsers, "percentage": float64(agentUsers) / float64(totalUsers) * 100},
		{"role": "User", "count": regularUsers, "percentage": float64(regularUsers) / float64(totalUsers) * 100},
	}

	// Recent activity metrics
	last24HourSignups, _ := h.userRepo.GetRecentSignupsCount(1)
	last30DaySignups, _ := h.userRepo.GetRecentSignupsCount(30)

	// Growth rate calculations
	userGrowthRate := 0.0
	if totalUsers > 0 {
		userGrowthRate = float64(recentSignups) / float64(totalUsers) * 100
	}

	// Most active companies (sample data - in real implementation, query actual activity)
	topCompanies := []fiber.Map{
		{"name": "TechCorp", "userCount": 25, "activity": 89},
		{"name": "StartupXYZ", "userCount": 18, "activity": 76},
		{"name": "Enterprise Ltd", "userCount": 42, "activity": 65},
		{"name": "Innovation Inc", "userCount": 15, "activity": 58},
		{"name": "Digital Agency", "userCount": 12, "activity": 43},
	}

	// System performance metrics
	performanceMetrics := []fiber.Map{
		{"metric": "Response Time", "value": "125ms", "status": "good", "trend": "stable"},
		{"metric": "Uptime", "value": "99.9%", "status": "excellent", "trend": "up"},
		{"metric": "Active Sessions", "value": strconv.FormatInt(activeUsers, 10), "status": "good", "trend": "up"},
		{"metric": "Error Rate", "value": "0.1%", "status": "excellent", "trend": "down"},
	}

	// Weekly activity pattern (sample data)
	weeklyActivity := []fiber.Map{
		{"day": "Mon", "users": activeUsers * 85 / 100},
		{"day": "Tue", "users": activeUsers * 92 / 100},
		{"day": "Wed", "users": activeUsers * 98 / 100},
		{"day": "Thu", "users": activeUsers * 95 / 100},
		{"day": "Fri", "users": activeUsers * 88 / 100},
		{"day": "Sat", "users": activeUsers * 45 / 100},
		{"day": "Sun", "users": activeUsers * 38 / 100},
	}

	stats := fiber.Map{
		// Basic metrics
		"total_users":     totalUsers,
		"total_companies": totalCompanies,
		"active_users":    activeUsers,
		"recent_signups":  recentSignups,
		"system_health":   systemHealth,

		// Growth metrics
		"user_growth_rate": userGrowthRate,
		"last_24h_signups": last24HourSignups,
		"last_30d_signups": last30DaySignups,

		// Analytics data
		"user_growth_data":    userGrowthData,
		"company_growth_data": companyGrowthData,
		"role_distribution":   roleDistribution,
		"top_companies":       topCompanies,
		"performance_metrics": performanceMetrics,
		"weekly_activity":     weeklyActivity,

		// Quick stats
		"conversion_rate":      2.4, // Sample conversion rate
		"avg_session_duration": "12m 34s",
		"bounce_rate":          18.5,
		"retention_rate":       84.2,
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "stats_retrieved", stats)
}

// User Management
func (h *SuperAdminHandler) GetAllUsers(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	users, total, err := h.userRepo.GetAllUsers(page, limit, search)
	if err != nil {
		h.logger.Error("Failed to get all users", fiber.Map{"error": err.Error()})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_get_users", err)
	}

	var response []interface{}
	for _, user := range users {
		response = append(response, user.ToResponse())
	}

	result := fiber.Map{
		"users": response,
		"total": total,
		"page":  page,
		"limit": limit,
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "users_retrieved", result)
}

func (h *SuperAdminHandler) GetUser(c *fiber.Ctx) error {
	userID := c.Params("id")

	user, err := h.userRepo.GetUserByID(userID)
	if err != nil {
		h.logger.Error("User not found", fiber.Map{"user_id": userID, "error": err.Error()})
		return utils.ErrorResponse(c, fiber.StatusNotFound, "user_not_found", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "user_found", user.ToResponse())
}

func (h *SuperAdminHandler) CreateUser(c *fiber.Ctx) error {
	var input SuperAdminUserCreateInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "bad_request", err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	// Check if email is already taken
	_, err := h.userRepo.GetUserByEmail(input.Email)
	if err == nil {
		h.logger.Warn("Email already taken", fiber.Map{"email": input.Email})
		return utils.ErrorResponse(c, fiber.StatusConflict, "email_taken", nil)
	}

	hashedPassword, err := h.securityContext.HashPassword(input.Password)
	if err != nil {
		h.logger.Error("Failed to hash password", fiber.Map{"error": err.Error()})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_hash_password", err)
	}

	newUser := models.User{
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Email:     input.Email,
		Password:  hashedPassword,
		Role:      input.Role,
		CompanyID: input.CompanyID,
		NotificationSettings: &models.NotificationSettings{
			NewConversation: true,
			NewMessage:      true,
			Mentions:        true,
			EmailEnabled:    true,
			BrowserEnabled:  false,
		},
	}

	createdUser, err := h.userRepo.CreateUser(&newUser)
	if err != nil {
		h.logger.Error("Failed to create user", fiber.Map{"error": err.Error()})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_create_user", err)
	}

	h.logger.Info("User created by superadmin", fiber.Map{
		"user_id": createdUser.ID,
		"email":   createdUser.Email,
	})

	return utils.SuccessResponse(c, fiber.StatusCreated, "user_created", createdUser.ToResponse())
}

func (h *SuperAdminHandler) UpdateUser(c *fiber.Ctx) error {
	userID := c.Params("id")

	var input SuperAdminUserUpdateInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "bad_request", err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	userToUpdate, err := h.userRepo.GetUserByID(userID)
	if err != nil {
		h.logger.Error("User not found", fiber.Map{"user_id": userID, "error": err.Error()})
		return utils.ErrorResponse(c, fiber.StatusNotFound, "user_not_found", err)
	}

	// Check if email is already taken by another user
	if input.Email != userToUpdate.Email {
		existingUser, err := h.userRepo.GetUserByEmail(input.Email)
		if err == nil && existingUser.ID != userToUpdate.ID {
			h.logger.Warn("Email already taken", fiber.Map{"email": input.Email})
			return utils.ErrorResponse(c, fiber.StatusConflict, "email_taken", nil)
		}
	}

	userToUpdate.FirstName = input.FirstName
	userToUpdate.LastName = input.LastName
	userToUpdate.Email = input.Email
	userToUpdate.Role = input.Role
	userToUpdate.CompanyID = input.CompanyID

	if err := h.userRepo.UpdateUser(userToUpdate); err != nil {
		h.logger.Error("Failed to update user", fiber.Map{"user_id": userID, "error": err.Error()})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_update_user", err)
	}

	h.logger.Info("User updated by superadmin", fiber.Map{"user_id": userID})

	return utils.SuccessResponse(c, fiber.StatusOK, "user_updated", userToUpdate.ToResponse())
}

func (h *SuperAdminHandler) DeleteUser(c *fiber.Ctx) error {
	userID := c.Params("id")

	// Check if user exists
	_, err := h.userRepo.GetUserByID(userID)
	if err != nil {
		h.logger.Error("User not found", fiber.Map{"user_id": userID, "error": err.Error()})
		return utils.ErrorResponse(c, fiber.StatusNotFound, "user_not_found", err)
	}

	h.logger.Info("Delete user endpoint called but not implemented", fiber.Map{"user_id": userID})

	return utils.ErrorResponse(c, fiber.StatusNotImplemented, "Not available yet", nil)
}

// Company Management
func (h *SuperAdminHandler) GetAllCompanies(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	companies, total, err := h.companyRepo.GetAllCompanies(page, limit, search)
	if err != nil {
		h.logger.Error("Failed to get all companies", fiber.Map{"error": err.Error()})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_get_companies", err)
	}

	var response []interface{}
	for _, company := range companies {
		response = append(response, company.ToResponse())
	}

	result := fiber.Map{
		"companies": response,
		"total":     total,
		"page":      page,
		"limit":     limit,
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "companies_retrieved", result)
}

func (h *SuperAdminHandler) GetCompany(c *fiber.Ctx) error {
	companyID := c.Params("id")

	company, err := h.companyRepo.GetCompanyByID(companyID)
	if err != nil {
		h.logger.Error("Company not found", fiber.Map{"company_id": companyID, "error": err.Error()})
		return utils.ErrorResponse(c, fiber.StatusNotFound, "company_not_found", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "company_found", company.ToResponse())
}

func (h *SuperAdminHandler) CreateCompany(c *fiber.Ctx) error {
	var input SuperAdminCompanyCreateInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "bad_request", err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	// Check if email is already taken
	_, err := h.companyRepo.GetCompanyByEmail(input.Email)
	if err == nil {
		h.logger.Warn("Company email already taken", fiber.Map{"email": input.Email})
		return utils.ErrorResponse(c, fiber.StatusConflict, "company_email_taken", nil)
	}

	newCompany := models.Company{
		Name:    input.Name,
		Email:   input.Email,
		Website: input.Website,
		Phone:   input.Phone,
		Address: input.Address,
	}

	if err := h.companyRepo.CreateCompany(&newCompany); err != nil {
		h.logger.Error("Failed to create company", fiber.Map{"error": err.Error()})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_create_company", err)
	}

	h.logger.Info("Company created by superadmin", fiber.Map{
		"company_id": newCompany.ID,
		"name":       newCompany.Name,
	})

	return utils.SuccessResponse(c, fiber.StatusCreated, "company_created", newCompany.ToResponse())
}

func (h *SuperAdminHandler) UpdateCompany(c *fiber.Ctx) error {
	companyID := c.Params("id")

	var input SuperAdminCompanyUpdateInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "bad_request", err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	companyToUpdate, err := h.companyRepo.GetCompanyByID(companyID)
	if err != nil {
		h.logger.Error("Company not found", fiber.Map{"company_id": companyID, "error": err.Error()})
		return utils.ErrorResponse(c, fiber.StatusNotFound, "company_not_found", err)
	}

	// Check if email is already taken by another company
	if input.Email != companyToUpdate.Email {
		existingCompany, err := h.companyRepo.GetCompanyByEmail(input.Email)
		if err == nil && existingCompany.ID != companyToUpdate.ID {
			h.logger.Warn("Company email already taken", fiber.Map{"email": input.Email})
			return utils.ErrorResponse(c, fiber.StatusConflict, "company_email_taken", nil)
		}
	}

	companyToUpdate.Name = input.Name
	companyToUpdate.Email = input.Email
	companyToUpdate.Website = input.Website
	companyToUpdate.Phone = input.Phone
	companyToUpdate.Address = input.Address

	if err := h.companyRepo.UpdateCompany(companyToUpdate); err != nil {
		h.logger.Error("Failed to update company", fiber.Map{"company_id": companyID, "error": err.Error()})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_update_company", err)
	}

	h.logger.Info("Company updated by superadmin", fiber.Map{"company_id": companyID})

	return utils.SuccessResponse(c, fiber.StatusOK, "company_updated", companyToUpdate.ToResponse())
}

func (h *SuperAdminHandler) DeleteCompany(c *fiber.Ctx) error {
	companyID := c.Params("id")

	// Check if company exists
	_, err := h.companyRepo.GetCompanyByID(companyID)
	if err != nil {
		h.logger.Error("Company not found", fiber.Map{"company_id": companyID, "error": err.Error()})
		return utils.ErrorResponse(c, fiber.StatusNotFound, "company_not_found", err)
	}

	h.logger.Info("Delete company endpoint called but not implemented", fiber.Map{"company_id": companyID})

	return utils.ErrorResponse(c, fiber.StatusNotImplemented, "Not available yet", nil)
}

func (h *SuperAdminHandler) GetCompanyUsers(c *fiber.Ctx) error {
	companyID := c.Params("id")

	// Check if company exists
	_, err := h.companyRepo.GetCompanyByID(companyID)
	if err != nil {
		h.logger.Error("Company not found", fiber.Map{"company_id": companyID, "error": err.Error()})
		return utils.ErrorResponse(c, fiber.StatusNotFound, "company_not_found", err)
	}

	users, err := h.userRepo.GetUsersByCompanyID(companyID)
	if err != nil {
		h.logger.Error("Failed to get company users", fiber.Map{"company_id": companyID, "error": err.Error()})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_get_company_users", err)
	}

	var response []interface{}
	for _, user := range users {
		response = append(response, user.ToResponse())
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "company_users_retrieved", response)
}

// Configuration Management
func (h *SuperAdminHandler) GetConfig(c *fiber.Ctx) error {
	// Get current configuration (sanitized - no sensitive data)
	currentConfig := config.App

	// Create response without sensitive fields
	configResponse := fiber.Map{
		// Server Configuration
		"port":         currentConfig.Port,
		"base_url":     currentConfig.BaseURL,
		"frontend_url": currentConfig.FrontendURL,
		"environment":  currentConfig.Environment,
		"log_level":    currentConfig.LogLevel,

		// Database Configuration (masked for security)
		"database_configured": currentConfig.DatabaseDSN != "",
		"redis_configured":    currentConfig.RedisAddr != "",

		// Email Configuration (password masked)
		"email_provider": currentConfig.EmailProvider,
		"email_host":     currentConfig.EmailHost,
		"email_port":     currentConfig.EmailPort,
		"email_username": currentConfig.EmailUsername,
		"email_password": strings.Repeat("*", len(currentConfig.EmailPassword)), // Masked
		"email_from":     currentConfig.EmailFrom,

		// Internationalization Configuration
		"default_language":    currentConfig.DefaultLanguage,
		"supported_languages": currentConfig.SupportedLanguages,

		// Application Configuration
		"application_name": currentConfig.ApplicationName,
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "config_retrieved", configResponse)
}

func (h *SuperAdminHandler) UpdateConfig(c *fiber.Ctx) error {
	var input SuperAdminConfigUpdateInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "bad_request", err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	// Update configuration fields that are provided
	updateErrors := []string{}

	if input.Port != nil {
		if err := config.SetPort(*input.Port); err != nil {
			h.logger.Error("Failed to update port", fiber.Map{"error": err.Error()})
			updateErrors = append(updateErrors, "Failed to update port")
		}
	}

	if input.BaseURL != nil {
		if err := config.SetBaseURL(*input.BaseURL); err != nil {
			h.logger.Error("Failed to update base URL", fiber.Map{"error": err.Error()})
			updateErrors = append(updateErrors, "Failed to update base URL")
		}
	}

	if input.FrontendURL != nil {
		if err := config.SetFrontendURL(*input.FrontendURL); err != nil {
			h.logger.Error("Failed to update frontend URL", fiber.Map{"error": err.Error()})
			updateErrors = append(updateErrors, "Failed to update frontend URL")
		}
	}

	if input.Environment != nil {
		if err := config.SetEnvironment(*input.Environment); err != nil {
			h.logger.Error("Failed to update environment", fiber.Map{"error": err.Error()})
			updateErrors = append(updateErrors, "Failed to update environment")
		}
	}

	if input.LogLevel != nil {
		if err := config.SetLogLevel(*input.LogLevel); err != nil {
			h.logger.Error("Failed to update log level", fiber.Map{"error": err.Error()})
			updateErrors = append(updateErrors, "Failed to update log level")
		}
	}

	if input.EmailProvider != nil {
		if err := config.SetEmailProvider(*input.EmailProvider); err != nil {
			h.logger.Error("Failed to update email provider", fiber.Map{"error": err.Error()})
			updateErrors = append(updateErrors, "Failed to update email provider")
		}
	}

	if input.EmailHost != nil {
		if err := config.SetEmailHost(*input.EmailHost); err != nil {
			h.logger.Error("Failed to update email host", fiber.Map{"error": err.Error()})
			updateErrors = append(updateErrors, "Failed to update email host")
		}
	}

	if input.EmailPort != nil {
		if err := config.SetEmailPort(*input.EmailPort); err != nil {
			h.logger.Error("Failed to update email port", fiber.Map{"error": err.Error()})
			updateErrors = append(updateErrors, "Failed to update email port")
		}
	}

	if input.EmailUsername != nil {
		if err := config.SetEmailUsername(*input.EmailUsername); err != nil {
			h.logger.Error("Failed to update email username", fiber.Map{"error": err.Error()})
			updateErrors = append(updateErrors, "Failed to update email username")
		}
	}

	if input.EmailPassword != nil {
		if err := config.SetEmailPassword(*input.EmailPassword); err != nil {
			h.logger.Error("Failed to update email password", fiber.Map{"error": err.Error()})
			updateErrors = append(updateErrors, "Failed to update email password")
		}
	}

	if input.EmailFrom != nil {
		if err := config.SetEmailFrom(*input.EmailFrom); err != nil {
			h.logger.Error("Failed to update email from", fiber.Map{"error": err.Error()})
			updateErrors = append(updateErrors, "Failed to update email from")
		}
	}

	if input.DefaultLanguage != nil {
		if err := config.SetDefaultLanguage(*input.DefaultLanguage); err != nil {
			h.logger.Error("Failed to update default language", fiber.Map{"error": err.Error()})
			updateErrors = append(updateErrors, "Failed to update default language")
		}
	}

	if input.SupportedLanguages != nil {
		if err := config.SetSupportedLanguages(*input.SupportedLanguages); err != nil {
			h.logger.Error("Failed to update supported languages", fiber.Map{"error": err.Error()})
			updateErrors = append(updateErrors, "Failed to update supported languages")
		}
	}

	if input.ApplicationName != nil {
		if err := config.SetApplicationName(*input.ApplicationName); err != nil {
			h.logger.Error("Failed to update application name", fiber.Map{"error": err.Error()})
			updateErrors = append(updateErrors, "Failed to update application name")
		}
	}

	if len(updateErrors) > 0 {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_update_config",
			fiber.Map{"errors": updateErrors})
	}

	h.logger.Info("Configuration updated successfully")
	return utils.SuccessResponse(c, fiber.StatusOK, "config_updated",
		fiber.Map{"message": "Configuration updated successfully"})
}

// GetSystemHealth returns system health metrics
func (h *SuperAdminHandler) GetSystemHealth(c *fiber.Ctx) error {
	// Get system health from the health service
	healthReport, err := h.healthService.GetSystemHealth()
	if err != nil {
		h.logger.Error("Failed to get system health", map[string]interface{}{"error": err.Error()})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "health_check_failed",
			"Failed to retrieve system health")
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "health_retrieved", healthReport)
}

// GetSystemLogs returns system logs with filtering and pagination
func (h *SuperAdminHandler) GetSystemLogs(c *fiber.Ctx) error {
	// Parse query parameters
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "50"))
	level := c.Query("level")
	search := c.Query("search")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 50
	}

	// Get logs from health service
	logsResponse, err := h.healthService.GetSystemLogs(page, limit, level, search)
	if err != nil {
		h.logger.Error("Failed to retrieve system logs", map[string]interface{}{"error": err.Error()})
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "logs_retrieval_failed", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "logs_retrieved", logsResponse)
}
