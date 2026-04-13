package handlers

import (
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"digsi-backend/internal/crypto"
	"digsi-backend/internal/db"
	"digsi-backend/internal/middleware"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/skip2/go-qrcode"
	"golang.org/x/crypto/bcrypt"
)

var TempPrivateKey *rsa.PrivateKey

// Request models
type AuthRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type GenerateRequest struct {
	SerialNumber string `json:"serial_number"`
	StudentName  string `json:"student_name"`
	CourseName   string `json:"course_name"`
	IssueDate    string `json:"issue_date"`
}

type VerifyRequest struct {
	SerialNumber string `json:"serial_number"`
	StudentName  string `json:"student_name"`
	CourseName   string `json:"course_name"`
	IssueDate    string `json:"issue_date"`
	Signature    string `json:"signature"`
}

type VerifyHashRequest struct {
	FileHash string `json:"file_hash"`
}

type RegisterHashRequest struct {
	FileHash    string `json:"file_hash"`
	StudentName string `json:"student_name"`
	CourseName  string `json:"course_name"`
	IssueDate   string `json:"issue_date"`
}

type ApproveRequest struct {
	ID uint `json:"id"`
}

// SetupRoutes configures the API routes
func SetupRoutes(app *fiber.App) {
	setup := func(router fiber.Router) {
		// Auth routes
		router.Post("/auth/register", RegisterUser)
		router.Post("/auth/login", LoginUser)

		// Core routes
		router.Post("/verify", VerifyCertificate)
		router.Post("/verify-hash", VerifyFileHash)
		router.Post("/submit-for-approval", SubmitForApproval)
		router.Get("/stats", GetStats)

		// Protected Admin routes
		admin := router.Group("/", middleware.AuthMiddleware)
		admin.Post("/generate", GenerateCertificate)
		admin.Post("/register-hash", RegisterFileHash)
		admin.Get("/pending-submissions", GetPendingSubmissions)
		admin.Post("/approve-hash", ApproveSubmission)
	}

	// Mount on both to handle Vercel proxy stripping behaviors
	setup(app.Group("/api"))
	setup(app)
}

// Auth Handlers
func RegisterUser(c *fiber.Ctx) error {
	var req AuthRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	hashed, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	user := db.User{
		Username: req.Username,
		Password: string(hashed),
	}

	if err := db.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Username already exists"})
	}

	return c.JSON(fiber.Map{"message": "Registration successful"})
}

func LoginUser(c *fiber.Ctx) error {
	var req AuthRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var user db.User
	if err := db.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "User not found"})
	}

	// Generate JWT Token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString(middleware.JWTSecret)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	return c.JSON(fiber.Map{
		"message":  "Login successful",
		"token":    tokenString,
		"username": user.Username,
		"role":     user.Role,
	})
}

// Certificate Handlers
func GenerateCertificate(c *fiber.Ctx) error {
	var req GenerateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	payload := crypto.CertificatePayload{
		SerialNumber: req.SerialNumber,
		StudentName:  req.StudentName,
		CourseName:   req.CourseName,
		IssueDate:    req.IssueDate,
	}

	signature, err := crypto.GenerateSignature(payload, TempPrivateKey)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate signature"})
	}

	// Persist to DB
	cert := db.Certificate{
		SerialNumber: req.SerialNumber,
		StudentName:  req.StudentName,
		CourseName:   req.CourseName,
		IssueDate:    req.IssueDate,
		Signature:    signature,
	}
	db.DB.Create(&cert)

	qrPayloadData := map[string]string{
		"serial_number": req.SerialNumber,
		"student_name":  req.StudentName,
		"course_name":   req.CourseName,
		"issue_date":    req.IssueDate,
		"signature":     signature,
	}
	
	importJson, _ := json.Marshal(qrPayloadData)
	pngBytes, err := qrcode.Encode(string(importJson), qrcode.Medium, 256)
	var qrBase64 string
	if err == nil {
		qrBase64 = base64.StdEncoding.EncodeToString(pngBytes)
	}

	return c.JSON(fiber.Map{
		"message":         "Certificate generated successfully.",
		"signature":       signature,
		"qr_image_base64": qrBase64,
	})
}

func VerifyCertificate(c *fiber.Ctx) error {
	var req VerifyRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	payload := crypto.CertificatePayload{
		SerialNumber: req.SerialNumber,
		StudentName:  req.StudentName,
		CourseName:   req.CourseName,
		IssueDate:    req.IssueDate,
	}

	valid, err := crypto.VerifySignature(payload, req.Signature, &TempPrivateKey.PublicKey)
	if err != nil || !valid {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"signature_valid": false,
			"error":           "Tampered or invalid signature.",
		})
	}

	return c.JSON(fiber.Map{
		"signature_valid": true,
		"message":         "Certificate is mathematically valid.",
	})
}

func RegisterFileHash(c *fiber.Ctx) error {
	var req RegisterHashRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	fileHash := db.FileHash{
		Hash:        req.FileHash,
		StudentName: req.StudentName,
		CourseName:  req.CourseName,
		IssueDate:   req.IssueDate,
	}
	
	if err := db.DB.Create(&fileHash).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Hash already registered"})
	}

	return c.JSON(fiber.Map{
		"message": "File registered in trusted ledger.",
		"hash":    req.FileHash,
	})
}

func VerifyFileHash(c *fiber.Ctx) error {
	var req VerifyHashRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	var row db.FileHash
	if err := db.DB.Where("hash = ?", req.FileHash).First(&row).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"signature_valid": false,
			"error":           "Hash not found in trusted ledger.",
		})
	}

	return c.JSON(fiber.Map{
		"signature_valid": true,
		"message":         "File matches trusted ledger.",
		"metadata":        row,
	})
}

func SubmitForApproval(c *fiber.Ctx) error {
	var sub db.PendingSubmission
	if err := c.BodyParser(&sub); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	sub.Status = "pending"
	db.DB.Create(&sub)

	return c.JSON(fiber.Map{"message": "Submitted for approval", "id": sub.ID})
}

func GetPendingSubmissions(c *fiber.Ctx) error {
	var list []db.PendingSubmission
	db.DB.Where("status = ?", "pending").Find(&list)
	return c.JSON(fiber.Map{"submissions": list})
}

func ApproveSubmission(c *fiber.Ctx) error {
	var req ApproveRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	var sub db.PendingSubmission
	if err := db.DB.First(&sub, req.ID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Submission not found"})
	}

	// Move to ledger
	ledger := db.FileHash{
		Hash:        sub.FileHash,
		StudentName: sub.StudentName,
		CourseName:  sub.CourseName,
		IssueDate:   sub.IssueDate,
	}
	db.DB.Create(&ledger)

	// Update status
	sub.Status = "approved"
	db.DB.Save(&sub)

	return c.JSON(fiber.Map{"message": "Submission approved and registered."})
}

func GetStats(c *fiber.Ctx) error {
	var countCerts int64
	var countHashes int64
	db.DB.Model(&db.Certificate{}).Count(&countCerts)
	db.DB.Model(&db.FileHash{}).Count(&countHashes)
	
	return c.JSON(fiber.Map{
		"total_certificates":  countCerts + countHashes,
		"today_verifications": 12, // Dummy for now
		"network_status":      "Active (Persistent)",
	})
}
