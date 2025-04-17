package main

import (
	"live-chat-server/config"
	"live-chat-server/container"
	handler "live-chat-server/handlers"
	"live-chat-server/i18n"
	"live-chat-server/listeners"
	"live-chat-server/models"
	"live-chat-server/router"
	"live-chat-server/websocket"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()
	config.Load()

	models.ConnectDatabase(config.App.DatabaseDSN)

	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	// Initialize dependency container and provide Fiber app
	c := container.NewContainer(models.DB, app)

	// Apply i18n middleware to detect language from request headers
	app.Use(i18n.Middleware(c.GetI18n()))

	// Get WebSocketHandler from container
	wsHandler := c.GetWebSocketHandler().(*websocket.WebSocketHandler)

	// Initialize WebSocket handlers
	handler.InitWebSocketHandlers(wsHandler.GetManager(), c)

	// Initialize listeners with WebSocketHandler
	listeners.NewContactListener(c.GetDispatcher(), wsHandler)
	listeners.NewInboxListener(c.GetDispatcher(), wsHandler)
	listeners.NewConversationListener(c.GetDispatcher(), wsHandler)

	// Start the job server
	container.StartJobServer(c)

	// Use the new DI router instead of the old one
	if err := c.GetDig().Invoke(router.SetupRoutesWithDI); err != nil {
		panic(err)
	}

	app.Listen(":" + config.App.Port)
}
