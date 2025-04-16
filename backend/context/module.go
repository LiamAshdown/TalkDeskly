package context

import (
	"go.uber.org/dig"
)

// RegisterContexts registers all contexts in the DI container
func RegisterContexts(container *dig.Container) {
	container.Provide(NewLanguageContext)
	container.Provide(NewSecurityContext)
}
