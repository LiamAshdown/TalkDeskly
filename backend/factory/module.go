package factory

import (
	"log"

	"go.uber.org/dig"
)

func RegisterModule(container *dig.Container) {
	if err := container.Provide(NewCommandFactory); err != nil {
		log.Fatalf("Failed to provide command factory: %v", err)
	}

	if err := container.Provide(NewResponseFactory); err != nil {
		log.Fatalf("Failed to provide response factory: %v", err)
	}
}
