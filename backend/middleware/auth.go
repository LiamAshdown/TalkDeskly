package middleware

import (
	"live-chat-server/models"
	"live-chat-server/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type AuthenticatedUser struct {
	ID    string
	Token string
	User  *models.User
}

func GetAuthUser(c *fiber.Ctx) *AuthenticatedUser {
	user, ok := c.Locals("user").(*AuthenticatedUser)
	if !ok {
		return nil
	}
	return user
}

// Auth middleware authenticates the user from the JWT token and loads the user data
func Auth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get Authorization header
		authHeader := c.Get("Authorization")
		if authHeader == "" || len(authHeader) < 8 || authHeader[:7] != "Bearer " {
			return utils.ErrorResponse(c, fiber.StatusUnauthorized, "unauthorized", nil)
		}

		// Extract token
		tokenString := authHeader[7:]

		// Parse and validate token using the utils.ParseJWT function
		token, err := utils.ParseJWT(tokenString)

		if err != nil || !token.Valid {
			return utils.ErrorResponse(c, fiber.StatusUnauthorized, "invalid_token", nil)
		}

		// Extract user ID from token claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return utils.ErrorResponse(c, fiber.StatusInternalServerError, "invalid_token_claims", nil)
		}

		userID, ok := claims["sub"].(string)
		if !ok || userID == "" {
			return utils.ErrorResponse(c, fiber.StatusInternalServerError, "invalid_user_id", nil)
		}

		// Load user from database
		var user models.User
		if result := models.DB.Preload("Company").Preload("NotificationSettings").First(&user, "id = ?", userID); result.Error != nil {
			return utils.ErrorResponse(c, fiber.StatusInternalServerError, "user_not_found", nil)
		}

		// Set the user in context
		authUser := &AuthenticatedUser{
			ID:    userID,
			Token: tokenString,
			User:  &user,
		}
		c.Locals("user", authUser)

		return c.Next()
	}
}

func IsAdmin() fiber.Handler {
	return func(c *fiber.Ctx) error {
		user := GetAuthUser(c)
		if user.User.Role != string(models.RoleAdmin) {
			return utils.ErrorResponse(c, fiber.StatusForbidden, "forbidden", nil)
		}
		return c.Next()
	}
}
