package utils

import (
	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

type ValidationError struct {
	Field   string `json:"field"`
	Tag     string `json:"tag"`
	Param   string `json:"param"`
	Message string `json:"message"`
}

func init() {
	RegisterValidators(validate)
}

func ValidateStruct(input interface{}) []ValidationError {
	err := validate.Struct(input)
	if err == nil {
		return nil
	}

	var errors []ValidationError
	for _, e := range err.(validator.ValidationErrors) {
		errors = append(errors, ValidationError{
			Field:   snakeCase(e.Field()),
			Tag:     e.Tag(),
			Param:   e.Param(),
			Message: "validation." + e.Tag(), // frontend can use this for translations
		})
	}
	return errors
}
