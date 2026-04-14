package db

import (
	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"log"
	"os"
	"strings"
)

var DB *gorm.DB

// User model for Admin/User Authentication
type User struct {
	gorm.Model
	Username string `gorm:"unique;not null" json:"username"`
	Password string `gorm:"not null" json:"-"`
	Role     string `gorm:"default:admin" json:"role"`
}

// Certificate model for RSA-signed seals
type Certificate struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	SerialNumber string `gorm:"unique;not null" json:"serial_number"`
	StudentName  string `json:"student_name"`
	CourseName   string `json:"course_name"`
	IssueDate    string `json:"issue_date"`
	Signature    string `json:"signature"`
}

// PendingSubmission model for Admin Inbox
type PendingSubmission struct {
	gorm.Model
	FileHash    string `json:"file_hash"`
	StudentName string `json:"student_name"`
	CourseName  string `json:"course_name"`
	IssueDate   string `json:"issue_date"`
	Status      string `gorm:"default:pending" json:"status"`
}

// FileHash model for the Trusted Ledger
type FileHash struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Hash        string `gorm:"unique;not null" json:"hash"`
	StudentName string `json:"student_name"`
	CourseName  string `json:"course_name"`
	IssueDate   string `json:"issue_date"`
}

func InitDB() {
	var err error
	// Check multiple possible environment variables from Vercel/Neon
	// Debug: Print available environment variable keys (NOT values) to identify Vercel naming
	for _, e := range os.Environ() {
		pair := strings.SplitN(e, "=", 2)
		key := pair[0]
		if strings.Contains(key, "DATABASE") || strings.Contains(key, "POSTGRES") || strings.Contains(key, "NEON") || strings.Contains(key, "URL") {
			log.Println("Found Env Var Key:", key)
		}
	}

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = os.Getenv("POSTGRES_URL")
	}
	if dsn == "" {
		dsn = os.Getenv("POSTGRES_PRISMA_URL")
	}
	if dsn == "" {
		dsn = os.Getenv("NEON_DATABASE_URL")
	}
	if dsn == "" {
		dsn = os.Getenv("STORAGE_URL")
	}

	if dsn != "" {
		log.Println("Connecting to PostgreSQL (Found DATABASE_URL)...")
		DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
			PrepareStmt: false,
		})
	} else {
		log.Println("Connecting to SQLite (digsi.db)...")
		DB, err = gorm.Open(sqlite.Open("digsi.db"), &gorm.Config{})
	}

	if err != nil {
		log.Printf("CRITICAL: Failed to connect to database using DSN. Error: %v", err)
		log.Fatal("Stopping backend due to database connection failure.")
	}

	// Auto-migrate the schema with localized error handling
	log.Println("Database schema check bypassed for Safe Startup mode.")
	/*
		err = DB.AutoMigrate(&User{}, &Certificate{}, &PendingSubmission{}, &FileHash{})
		if err != nil {
			log.Printf("WARNING: Database migration failed. Error: %v", err)
		} else {
			log.Println("Database schema is up to date.")
		}
	*/
}
