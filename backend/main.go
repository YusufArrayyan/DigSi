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

	// IMMEDIATE HEALTH CHECK (Pre-DB, Pre-Keys)
	app.Get("/api/health", func(c *fiber.Ctx) error {
		return c.Status(200).SendString("OK")
	})
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(200).SendString("OK")
	})

	// Initialize Database
	db.InitDB()

	// Initialize single node RSA Key with persistence (Cloud Friendly)
	keyPath := "keys/private_key.pem"
	if os.Getenv("VERCEL") != "" {
		keyPath = "/tmp/private_key.pem"
		fmt.Println("Vercel environment detected. Using /tmp for RSA keys.")
	}

	if err := os.MkdirAll("keys", 0755); err != nil {
		if os.Getenv("VERCEL") == "" {
			log.Fatalf("Failed to create keys directory: %v", err)
		} else {
			log.Printf("WARNING: Could not create keys directory in root: %v (Expected on Vercel)", err)
		}
	}

	var privKey *rsa.PrivateKey
	if _, err := os.Stat(keyPath); os.IsNotExist(err) {
		fmt.Println("Generating new 2048-bit RSA keypair...")
		privKey, err = rsa.GenerateKey(rand.Reader, 2048)
		if err != nil {
			log.Fatalf("Failed to generate RSA key: %v", err)
		}

		// Save the key (Graceful error handling)
		keyFile, err := os.Create(keyPath)
		if err == nil {
			pem.Encode(keyFile, &pem.Block{
				Type:  "RSA PRIVATE KEY",
				Bytes: x509.MarshalPKCS1PrivateKey(privKey),
			})
			keyFile.Close()
			fmt.Println("Key saved to", keyPath)
		} else {
			log.Printf("WARNING: Failed to save private key to disk: %v", err)
		}
	} else {
		fmt.Println("Loading existing RSA keypair from", keyPath)
		keyData, err := os.ReadFile(keyPath)
		if err != nil {
			log.Fatalf("Failed to read private key: %v", err)
		}
		block, _ := pem.Decode(keyData)
		if block == nil {
			log.Printf("ERROR: Failed to decode RSA private key from %s", keyPath)
			return
		}
		privKey, err = x509.ParsePKCS1PrivateKey(block.Bytes)
		if err != nil {
			log.Printf("ERROR: Failed to parse private key: %v", err)
			return
		}
	}
	handlers.TempPrivateKey = privKey

	// Map handlers
	handlers.SetupRoutes(app)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Fatal(app.Listen(":" + port))
}
