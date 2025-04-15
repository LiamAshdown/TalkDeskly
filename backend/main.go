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

	// Initialize dependency container and provide Fiber app
	c := container.NewContainer(models.DB)

	// Register the Fiber app in the DI container
	if err := c.GetDig().Provide(func() *fiber.App { return app }); err != nil {
		panic(err)
	}

	// For backwards compatibility during transition
	websocket.Init(c.GetWebSocketService(), c.GetLogger())
	handler.InitWebSocketHandlers(websocket.GetManager(), c)

	listeners.NewContactListener(c.GetDispatcher())
	listeners.NewInboxListener(c.GetDispatcher())
	listeners.NewConversationListener(c.GetDispatcher())

	// Start the job server
	container.StartJobServer(c)

	// Use the new DI router instead of the old one
	if err := c.GetDig().Invoke(router.SetupRoutesWithDI); err != nil {
		panic(err)
	}

	app.Listen(":" + config.App.Port)
}
