package crypto

import (
	"crypto/rand"
	"crypto/rsa"
	"testing"
)

func TestRSAFlow(t *testing.T) {
	// 1. Generate a test keypair
	privKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("Failed to generate key: %v", err)
	}
	pubKey := &privKey.PublicKey

	// 2. Define test payload
	payload := CertificatePayload{
		SerialNumber: "CERT-2026-001",
		StudentName:  "Jane Doe",
		CourseName:   "Blockchain Security",
		IssueDate:    "2026-04-13",
	}

	// 3. Sign the payload
	signature, err := GenerateSignature(payload, privKey)
	if err != nil {
		t.Fatalf("Failed to sign payload: %v", err)
	}

	if signature == "" {
		t.Fatal("Signature should not be empty")
	}

	// 4. Verify the payload
	valid, err := VerifySignature(payload, signature, pubKey)
	if err != nil {
		t.Fatalf("Verification error: %v", err)
	}

	if !valid {
		t.Error("Signature verification failed, but it should have passed")
	}

	// 5. Verify failure with tampered payload
	tamperedPayload := payload
	tamperedPayload.StudentName = "John Doe"
	valid, err = VerifySignature(tamperedPayload, signature, pubKey)
	if err == nil || valid {
		t.Error("Signature verification should have failed for tampered payload")
	}
}
