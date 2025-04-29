package utils

import (
	"unicode"
)

var prefixes = []string{
	"Uni", "Dra", "Pho", "Griff", "Pega", "Sphin", "Merm", "Cent", "Fae", "Elf",
	"Cyc", "Hyd", "Bas", "Chim", "Kra", "Levi", "Mino", "Nym", "Ogre", "Pix",
	"Roc", "Sire", "Troll", "Valk", "Wyrm", "Xorn", "Yeti", "Zomb",
}

var suffixes = []string{
	"corn", "gon", "nix", "in", "sus", "x", "aid", "taur", "rie", "in",
	"lops", "ra", "ilisk", "era", "ken", "athan", "taur", "ph", "ie", "ie",
	"k", "n", "in", "yrie", "ling", "ie", "i", "ie",
}

var firstNames = []string{
	"James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles",
	"Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen",
	"Emma", "Olivia", "Ava", "Isabella", "Sophia", "Charlotte", "Mia", "Amelia", "Harper", "Evelyn",
	"Liam", "Noah", "Oliver", "Elijah", "William", "Henry", "Lucas", "Theodore", "Jack", "Levi",
}

var lastNames = []string{
	"Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
	"Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
	"Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
}

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
