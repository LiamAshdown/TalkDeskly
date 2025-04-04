package utils

import "unicode"

func snakeCase(s string) string {
	out := ""
	for i, r := range s {
		if unicode.IsUpper(r) && i > 0 {
			out += "_"
		}
		out += string(unicode.ToLower(r))
	}
	return out
}

func Unique[T comparable](slice []T) []T {
	uniqueMap := make(map[T]bool)
	uniqueSlice := []T{}
	for _, v := range slice {
		if !uniqueMap[v] {
			uniqueMap[v] = true
			uniqueSlice = append(uniqueSlice, v)
		}
	}
	return uniqueSlice
}

func Contains[T comparable](slice []T, item T) bool {
	for _, v := range slice {
		if v == item {
			return true
		}
	}
	return false
}

func RemoveFromSlice[T comparable](slice []T, item T) []T {
	for i, v := range slice {
		if v == item {
			return append(slice[:i], slice[i+1:]...)
		}
	}

	return slice
}

func GetStringValue(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}
