package main

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"log"
	"os"

	"digsi-backend/internal/db"
	"digsi-backend/internal/handlers"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables for local development
	_ = godotenv.Load()

	// Initialize Database
	db.InitDB()

	// Initialize single node RSA Key with persistence
	keyPath := "keys/private_key.pem"
	if err := os.MkdirAll("keys", 0755); err != nil {
		log.Fatalf("Failed to create keys directory: %v", err)
	}

	var privKey *rsa.PrivateKey
	if _, err := os.Stat(keyPath); os.IsNotExist(err) {
		fmt.Println("Generating new 2048-bit RSA keypair...")
		privKey, err = rsa.GenerateKey(rand.Reader, 2048)
		if err != nil {
			log.Fatalf("Failed to generate RSA key: %v", err)
		}

		// Save the key
		keyFile, _ := os.Create(keyPath)
		pem.Encode(keyFile, &pem.Block{
			Type:  "RSA PRIVATE KEY",
			Bytes: x509.MarshalPKCS1PrivateKey(privKey),
		})
		keyFile.Close()
		fmt.Println("Key saved to", keyPath)
	} else {
		fmt.Println("Loading existing RSA keypair from", keyPath)
		keyData, err := os.ReadFile(keyPath)
		if err != nil {
			log.Fatalf("Failed to read private key: %v", err)
		}
		block, _ := pem.Decode(keyData)
		privKey, err = x509.ParsePKCS1PrivateKey(block.Bytes)
		if err != nil {
			log.Fatalf("Failed to parse private key: %v", err)
		}
	}
	handlers.TempPrivateKey = privKey

	app := fiber.New(fiber.Config{
		AppName: "DigSi Backend API",
	})

	app.Use(recover.New())
	app.Use(logger.New())

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	// Apply Rate Limiting manually using internal state 
	apiGroup := app.Group("/api")
	_ = apiGroup 

	// Actually map the handlers with rate limitation
	handlers.SetupRoutes(app)

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendString("OK")
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Fatal(app.Listen(":" + port))
}
