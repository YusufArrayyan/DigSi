package middleware

import (
	"fmt"
	"time"

	"digsi-backend/internal/db"

	"github.com/gofiber/fiber/v2"
)

// RateLimit sets a maximum number of requests per IP within a window.
func RateLimit(maxRequests int, window time.Duration) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ip := c.IP()
		key := fmt.Sprintf("rate_limit:%s", ip)

		// Increment the request count
		count, err := db.RDB.Incr(db.Ctx, key).Result()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Internal Server Error",
			})
		}

		// Set expiration if it's the first request in the window
		if count == 1 {
			db.RDB.Expire(db.Ctx, key, window)
		}

		if count > int64(maxRequests) {
			// IP has exceeded the limit, return 429 Too Many Requests
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "Rate limit exceeded. Please try again later.",
			})
		}

		return c.Next()
	}
}
