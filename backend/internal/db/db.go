package db

import (
	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"log"
	"os"
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
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = os.Getenv("POSTGRES_URL") // Support Vercel name
	}

	if dsn != "" {
		log.Println("Connecting to PostgreSQL...")
		DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	} else {
		log.Println("Connecting to SQLite (digsi.db)...")
		DB, err = gorm.Open(sqlite.Open("digsi.db"), &gorm.Config{})
	}

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto-migrate the schema
	err = DB.AutoMigrate(&User{}, &Certificate{}, &PendingSubmission{}, &FileHash{})
	if err != nil {
		log.Fatal("Failed to migrate database schema:", err)
	}
}
