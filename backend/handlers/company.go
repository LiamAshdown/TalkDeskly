package handler

import (
	"live-chat-server/middleware"
	"live-chat-server/models"
	"live-chat-server/services"
	"live-chat-server/utils"

	"github.com/gofiber/fiber/v2"
)

var fileService = services.NewFileService(services.DefaultImageConfig)

type CompanyInput struct {
	Name    string `json:"name" validate:"required,min=2,max=255"`
	Email   string `json:"email" validate:"required,email"`
	Website string `json:"website" validate:"omitempty,url"`
	Phone   string `json:"phone" validate:"omitempty,min=5,max=50"`
	Address string `json:"address" validate:"omitempty,min=5,max=500"`
	Logo    string `json:"logo"`
}

type CompanyResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Website   string `json:"website"`
	Phone     string `json:"phone"`
	Address   string `json:"address"`
	Logo      string `json:"logo"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

func GetCompany(c *fiber.Ctx) error {
	user := middleware.GetAuthUser(c)

	var company models.Company
	if err := models.DB.First(&company, "id = ?", user.User.CompanyID).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "company_not_found", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "company_found", company.ToResponse())
}

func UpdateCompany(c *fiber.Ctx) error {
	user := middleware.GetAuthUser(c)

	var input CompanyInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "bad_request", err)
	}

	if err := utils.ValidateStruct(input); err != nil {
		return utils.ValidationErrorResponse(c, err)
	}

	var company models.Company
	if err := models.DB.First(&company, "id = ?", user.User.CompanyID).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "company_not_found", err)
	}

	company.Name = input.Name
	company.Email = input.Email
	company.Website = input.Website
	company.Phone = input.Phone
	company.Address = input.Address

	if err := models.DB.Save(&company).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_update_company", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "company_updated", company.ToResponse())
}

func UploadCompanyLogo(c *fiber.Ctx) error {
	user := middleware.GetAuthUser(c)

	// Upload the file
	filename, err := fileService.UploadFile(c, "logo", "company-logos")
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "file_upload_failed", err)
	}

	// Update company logo in database
	var company models.Company
	if err := models.DB.First(&company, "id = ?", user.User.CompanyID).Error; err != nil {
		// Clean up the uploaded file if company not found
		fileService.DeleteFile(filename, "company-logos")
		return utils.ErrorResponse(c, fiber.StatusNotFound, "company_not_found", err)
	}

	// Delete old logo if exists
	if err := fileService.DeleteFile(company.Logo, "company-logos"); err != nil {
		// Log the error but continue with the update
		// The old file might have been already deleted
	}

	company.Logo = filename
	if err := models.DB.Save(&company).Error; err != nil {
		// Clean up the uploaded file if database update fails
		fileService.DeleteFile(filename, "company-logos")
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "failed_to_update_company_logo", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "logo_uploaded", company.ToResponse())
}
