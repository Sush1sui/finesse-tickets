package utils

import (
	"fmt"
	"net/url"
)

type ValidationErrors map[string]string

func (v ValidationErrors) Error() string {
	if len(v) == 0 {
		return ""
	}
	for _, msg := range v {
		return msg
	}
	return "validation error"
}

func ValidateRequired(value, field string, errs ValidationErrors) {
	if value == "" {
		errs[field] = field + " is required"
	}
}

func ValidateMaxLength(value, field string, max int, errs ValidationErrors) {
	if len(value) > max {
		errs[field] = fmt.Sprintf("%s must be at most %d characters", field, max)
	}
}

func ValidateIntRange(value int, field string, min, max int, errs ValidationErrors) {
	if value < min || value > max {
		errs[field] = fmt.Sprintf("%s must be between %d and %d", field, min, max)
	}
}

func ValidateSnowflake(value, field string, errs ValidationErrors) {
	if value == "" {
		return
	}
	if len(value) > 32 {
		errs[field] = fmt.Sprintf("%s is not a valid snowflake", field)
		return
	}
	for _, c := range value {
		if c < '0' || c > '9' {
			errs[field] = fmt.Sprintf("%s is not a valid snowflake", field)
			return
		}
	}
}

func ValidateBtnColor(value, field string, errs ValidationErrors) {
	valid := map[string]bool{
		"success":  true,
		"danger":   true,
		"primary":  true,
		"secondary": true,
	}
	if !valid[value] {
		errs[field] = field + " must be one of: success, danger, primary, secondary"
	}
}

func ValidateHTTPSURL(value, field string, errs ValidationErrors) {
	if value == "" {
		return
	}
	u, err := url.Parse(value)
	if err != nil || (u.Scheme != "https" && u.Scheme != "http") {
		errs[field] = field + " must be a valid http/https URL"
	}
}
