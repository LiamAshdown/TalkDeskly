package services

import (
	"fmt"
	"io"
	"live-chat-server/config"
	"live-chat-server/interfaces"
	"os"
	"path/filepath"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// ZapLogger implements the Logger interface using Zap
type ZapLogger struct {
	logger *zap.Logger
}

// NewLogger creates a new ZapLogger instance with file and console output
func NewLogger(config config.ConfigManager) interfaces.Logger {
	// Ensure logs directory exists
	logDir := "logs"
	if err := os.MkdirAll(logDir, 0755); err != nil {
		// Fall back to current directory if logs dir can't be created
		logDir = "."
	}

	// Create log files
	logFile, err := os.OpenFile(filepath.Join(logDir, "app.log"), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		logFile = os.Stdout // Fall back to stdout
	}

	errorFile, err := os.OpenFile(filepath.Join(logDir, "error.log"), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		errorFile = os.Stderr // Fall back to stderr
	}

	// Create encoders
	var consoleEncoder zapcore.Encoder
	var fileEncoder zapcore.Encoder

	if config.GetConfig().Environment == "production" {
		// Production: JSON format for files, simplified console
		fileEncoderConfig := zap.NewProductionEncoderConfig()
		fileEncoderConfig.TimeKey = "timestamp"
		fileEncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
		fileEncoder = zapcore.NewJSONEncoder(fileEncoderConfig)

		consoleEncoderConfig := zap.NewProductionEncoderConfig()
		consoleEncoderConfig.EncodeLevel = zapcore.CapitalLevelEncoder
		consoleEncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
		consoleEncoder = zapcore.NewConsoleEncoder(consoleEncoderConfig)
	} else {
		// Development: Console format for console, JSON for files
		consoleEncoderConfig := zap.NewDevelopmentEncoderConfig()
		consoleEncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
		consoleEncoder = zapcore.NewConsoleEncoder(consoleEncoderConfig)

		fileEncoderConfig := zap.NewProductionEncoderConfig()
		fileEncoderConfig.TimeKey = "timestamp"
		fileEncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
		fileEncoder = zapcore.NewJSONEncoder(fileEncoderConfig)
	}

	// Set log levels
	var logLevel zapcore.Level
	switch config.GetConfig().LogLevel {
	case "debug":
		logLevel = zapcore.DebugLevel
	case "info":
		logLevel = zapcore.InfoLevel
	case "warn":
		logLevel = zapcore.WarnLevel
	case "error":
		logLevel = zapcore.ErrorLevel
	default:
		logLevel = zapcore.InfoLevel
	}

	// Create cores
	var cores []zapcore.Core

	// Console output (all levels >= configured level)
	consoleCore := zapcore.NewCore(
		consoleEncoder,
		zapcore.AddSync(os.Stdout),
		logLevel,
	)
	cores = append(cores, consoleCore)

	// File output for all logs (all levels >= configured level)
	fileCore := zapcore.NewCore(
		fileEncoder,
		zapcore.AddSync(io.MultiWriter(logFile)),
		logLevel,
	)
	cores = append(cores, fileCore)

	// Error file output (only errors and above)
	errorFileCore := zapcore.NewCore(
		fileEncoder,
		zapcore.AddSync(io.MultiWriter(errorFile)),
		zapcore.ErrorLevel,
	)
	cores = append(cores, errorFileCore)

	// Combine cores
	core := zapcore.NewTee(cores...)

	// Create logger with caller information
	logger := zap.New(core, zap.AddCaller(), zap.AddCallerSkip(1), zap.AddStacktrace(zapcore.ErrorLevel))

	return &ZapLogger{
		logger: logger,
	}
}

// With returns a new logger with the given fields added to the context
func (l *ZapLogger) With(fields map[string]interface{}) interfaces.Logger {
	return &ZapLogger{
		logger: l.logger.With(convertToZapFields(fields)...),
	}
}

// Named returns a new logger with the given name added to the context
func (l *ZapLogger) Named(name string) interfaces.Logger {
	return &ZapLogger{
		logger: l.logger.Named(name),
	}
}

// Helper function to convert our field map to Zap fields
func convertToZapFields(fields map[string]interface{}) []zap.Field {
	zapFields := make([]zap.Field, 0, len(fields))
	for k, v := range fields {
		zapFields = append(zapFields, zap.Any(k, v))
	}
	return zapFields
}

// Debug logs a formatted message at debug level
func (l *ZapLogger) Debug(format string, args ...interface{}) {
	l.logger.Debug(fmt.Sprintf(format, args...))
}

// Info logs a formatted message at info level
func (l *ZapLogger) Info(format string, args ...interface{}) {
	l.logger.Info(fmt.Sprintf(format, args...))
}

// Warn logs a formatted message at warn level
func (l *ZapLogger) Warn(format string, args ...interface{}) {
	l.logger.Warn(fmt.Sprintf(format, args...))
}

// Error logs a formatted message at error level
func (l *ZapLogger) Error(format string, args ...interface{}) {
	l.logger.Error(fmt.Sprintf(format, args...))
}

// Fatal logs a formatted message at fatal level and then exits with status 1
func (l *ZapLogger) Fatal(format string, args ...interface{}) {
	l.logger.Fatal(fmt.Sprintf(format, args...))
}
