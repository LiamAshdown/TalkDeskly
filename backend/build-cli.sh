#!/bin/bash

# Build script for TalkDeskly CLI
set -e

echo "🔨 Building TalkDeskly CLI..."

# Set the binary name
BINARY_NAME="talkdeskly"

# Build for current platform
echo "Building for current platform..."
go build -o ${BINARY_NAME} .

echo "✅ Build complete!"
echo ""
echo "Usage examples:"
echo "  ./${BINARY_NAME} --help                  # Show help"
echo "  ./${BINARY_NAME} migrate run             # Run migrations"
echo "  ./${BINARY_NAME} seed run                # Seed database"
echo "  ./${BINARY_NAME} db status               # Check database"
echo "  ./${BINARY_NAME} config:show             # Show config"
echo "  ./${BINARY_NAME} serve                   # Start server"
echo ""
echo "To run the web server without CLI:"
echo "  go run main.go                           # Start web server directly" 