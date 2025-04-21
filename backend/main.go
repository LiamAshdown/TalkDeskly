package main

import (
	"live-chat-server/config"
	"live-chat-server/container"
	"live-chat-server/i18n"
	"live-chat-server/models"
	"live-chat-server/router"

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

	// Start the job server
	container.StartJobServer(c)

	// Use the new DI router instead of the old one
	if err := c.GetDig().Invoke(router.SetupRoutesWithDI); err != nil {
		panic(err)
	}

	app.Listen(":" + config.App.Port)
}
