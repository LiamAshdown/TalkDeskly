package utils

import (
	"fmt"
	"live-chat-server/types"
	"reflect"
	"regexp"
	"strings"

	"github.com/go-playground/validator/v10"
)

var timeRegex = regexp.MustCompile(`^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$`)

func validateWorkingHours(fl validator.FieldLevel) bool {
	workingHours, ok := fl.Field().Interface().(map[string]types.WorkingHours)
	if !ok {
		return false
	}

	// Check if all days of the week are present
	requiredDays := []string{"monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"}
	for _, day := range requiredDays {
		if _, exists := workingHours[day]; !exists {
			return false
		}
	}

	// Validate each day's working hours
	for _, hours := range workingHours {
		// Validate time format (HH:mm)
		if !timeRegex.MatchString(hours.StartTime) || !timeRegex.MatchString(hours.EndTime) {
			return false
		}

		// If enabled, ensure start time is before end time
		if hours.Enabled {
			startTime := strings.Split(hours.StartTime, ":")
			endTime := strings.Split(hours.EndTime, ":")

			startHour := parseInt(startTime[0])
			startMin := parseInt(startTime[1])
			endHour := parseInt(endTime[0])
			endMin := parseInt(endTime[1])

			// Convert to minutes for easier comparison
			startMinutes := startHour*60 + startMin
			endMinutes := endHour*60 + endMin

			if startMinutes >= endMinutes {
				return false
			}
		}
	}

	return true
}

func parseInt(s string) int {
	var result int
	fmt.Sscanf(s, "%d", &result)
	return result
}

func validateOptionalString(fl validator.FieldLevel) bool {
	field := fl.Field()

	// If it's not a pointer, skip (invalid usage)
	if field.Kind() != reflect.Ptr {
		return true
	}

	// If nil, validation passes
	if field.IsNil() {
		return true
	}

	// If it's an empty string, validation passes
	str := field.Elem().String()
	if str == "" {
		return true
	}

	// Get the actual validation rules from the param
	param := fl.Param()
	if param == "" {
		return true
	}

	// Run the actual validation rules
	return validate.Var(str, param) == nil
}

func IsEmailValid(email string) bool {
	return validate.Var(email, "required,email") == nil
}

func RegisterValidators(v *validator.Validate) {
	v.RegisterValidation("working_hours", validateWorkingHours)
	v.RegisterValidation("optional", validateOptionalString)
}
