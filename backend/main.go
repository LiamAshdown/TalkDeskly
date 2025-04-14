package main

import (
	"live-chat-server/config"
	"live-chat-server/container"
	handler "live-chat-server/handlers"
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

	// Initialize dependency container
	c := container.NewContainer(models.DB)

	websocket.Init(c.GetWebSocketService())
	handler.InitWebSocketHandlers(websocket.GetManager(), c)

	listeners.NewContactListener(c.GetDispatcher())
	listeners.NewInboxListener(c.GetDispatcher())
	listeners.NewConversationListener(c.GetDispatcher())

	// Setup routes with dependencies
	router.SetupRoutes(app, c)

	app.Listen(":" + config.App.Port)
}
