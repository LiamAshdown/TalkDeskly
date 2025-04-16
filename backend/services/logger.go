package services

import (
	"fmt"
	"live-chat-server/config"
	"live-chat-server/interfaces"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// ZapLogger implements the Logger interface using Zap
type ZapLogger struct {
	logger *zap.Logger
}

// NewLogger creates a new ZapLogger instance
func NewLogger(config config.Config) interfaces.Logger {
	var logger *zap.Logger
	var err error

	if config.Environment == "production" {
		// Production config: JSON format, higher performance
		config := zap.NewProductionConfig()
		config.EncoderConfig.TimeKey = "timestamp"
		config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
		logger, err = config.Build(zap.AddCallerSkip(1))
	} else {
		// Development config: console format, colorized output
		config := zap.NewDevelopmentConfig()
		config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
		logger, err = config.Build(zap.AddCallerSkip(1))
	}

	if err != nil {
		// If logger creation fails, fall back to a minimal logger
		logger, _ = zap.NewProduction()
	}

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

// Debugf logs a formatted message at debug level
func (l *ZapLogger) Debug(format string, args ...interface{}) {
	l.logger.Debug(fmt.Sprintf(format, args...))
}

// Infof logs a formatted message at info level
func (l *ZapLogger) Info(format string, args ...interface{}) {
	l.logger.Info(fmt.Sprintf(format, args...))
}

// Warnf logs a formatted message at warn level
func (l *ZapLogger) Warn(format string, args ...interface{}) {
	l.logger.Warn(fmt.Sprintf(format, args...))
}

// Errorf logs a formatted message at error level
func (l *ZapLogger) Error(format string, args ...interface{}) {
	l.logger.Error(fmt.Sprintf(format, args...))
}

// Fatalf logs a formatted message at fatal level and then exits with status 1
func (l *ZapLogger) Fatal(format string, args ...interface{}) {
	l.logger.Fatal(fmt.Sprintf(format, args...))
}
