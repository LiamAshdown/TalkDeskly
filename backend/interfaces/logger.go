package interfaces

// Logger defines the interface for the application logger
type Logger interface {
	// Debug logs a message at debug level
	// If the first argument is a format string and additional args are provided,
	// it formats the message using fmt.Sprintf.
	Debug(msg string, args ...interface{})

	// Info logs a message at info level
	// If the first argument is a format string and additional args are provided,
	// it formats the message using fmt.Sprintf.
	Info(msg string, args ...interface{})

	// Warn logs a message at warn level
	// If the first argument is a format string and additional args are provided,
	// it formats the message using fmt.Sprintf.
	Warn(msg string, args ...interface{})

	// Error logs a message at error level
	// If the first argument is a format string and additional args are provided,
	// it formats the message using fmt.Sprintf.
	Error(msg string, args ...interface{})

	// Fatal logs a message at fatal level and then exits with status 1
	// If the first argument is a format string and additional args are provided,
	// it formats the message using fmt.Sprintf.
	Fatal(msg string, args ...interface{})

	// With returns a new logger with the given fields added to the context
	With(fields map[string]interface{}) Logger

	// Named returns a new logger with the given name added to the context
	Named(name string) Logger
}
