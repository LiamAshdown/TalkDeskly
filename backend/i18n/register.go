package i18n

import (
	"go.uber.org/dig"
)

// RegisterI18nServices registers all i18n related services with the DI container
func RegisterI18nServices(container *dig.Container) {
	// Register the i18n service
	if err := container.Provide(NewI18nService); err != nil {
		panic(err)
	}
}
