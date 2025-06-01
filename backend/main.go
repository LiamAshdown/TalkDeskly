package main

import (
	"live-chat-server/cmd"
	"live-chat-server/config"
	"live-chat-server/container"
	"live-chat-server/i18n"
	"live-chat-server/models"
	"live-chat-server/router"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
	// If CLI arguments are provided, run the CLI
	if len(os.Args) > 1 {
		cmd.Execute()
		return
	}

	// Otherwise, start the web server
	startWebServer()
}

func startWebServer() {
	_ = godotenv.Load()
	config.Load()

	models.ConnectDatabase(config.App.DatabaseDSN)

	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	c := container.NewContainer(models.DB, app)

	app.Use(i18n.Middleware(c.GetI18n()))

	container.StartJobServer(c)

	if err := c.GetDig().Invoke(router.SetupRoutesWithDI); err != nil {
		panic(err)
	}

	app.Listen(":" + config.App.Port)
}
