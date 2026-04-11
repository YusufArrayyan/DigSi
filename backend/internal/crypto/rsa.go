package crypto

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
)

type CertificatePayload struct {
	SerialNumber string `json:"serial_number"`
	StudentName  string `json:"student_name"`
	CourseName   string `json:"course_name"`
	IssueDate    string `json:"issue_date"`
}

// GenerateSignature hashes the payload and signs it using RSA-2048
func GenerateSignature(payload CertificatePayload, privKey *rsa.PrivateKey) (string, error) {
	// Serialize payload to JSON. 
	// Note: in a production setting, ensure deterministic serialization or use a specific fixed format so the hash is identical.
	data, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	// Hash the payload with SHA-256
	msgHash := sha256.New()
	msgHash.Write(data)
	msgHashSum := msgHash.Sum(nil)

	// Sign the hash using the Private Key
	signature, err := rsa.SignPKCS1v15(rand.Reader, privKey, crypto.SHA256, msgHashSum)
	if err != nil {
		return "", err
	}

	// Return Base64 encoded signature
	return base64.StdEncoding.EncodeToString(signature), nil
}

// VerifySignature ensures payload integrity against a provided signature
func VerifySignature(payload CertificatePayload, signatureBase64 string, pubKey *rsa.PublicKey) (bool, error) {
	signature, err := base64.StdEncoding.DecodeString(signatureBase64)
	if err != nil {
		return false, err
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return false, err
	}

	msgHash := sha256.New()
	msgHash.Write(data)
	msgHashSum := msgHash.Sum(nil)

	// Verify the RSA signature against the hash
	err = rsa.VerifyPKCS1v15(pubKey, crypto.SHA256, msgHashSum, signature)
	if err != nil {
		// Tampered or invalid signature
		return false, errors.New("signature invalid")
	}

	return true, nil
}
