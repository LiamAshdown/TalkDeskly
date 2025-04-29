package utils

import (
	"fmt"
	"math/rand"
	"time"
)

var randomSource = rand.NewSource(time.Now().UnixNano())
var random = rand.New(randomSource)

func GenerateRandomID() string {
	return fmt.Sprintf("%d", time.Now().UnixNano()+int64(random.Intn(10000)))
}

func generateFantasyName() string {
	prefix := prefixes[rand.Intn(len(prefixes))]
	suffix := suffixes[rand.Intn(len(suffixes))]
	return prefix + suffix
}

func GenerateRandomName() string {
	firstPart := generateFantasyName()
	secondPart := generateFantasyName()
	return fmt.Sprintf("%s %s", firstPart, secondPart)
}
