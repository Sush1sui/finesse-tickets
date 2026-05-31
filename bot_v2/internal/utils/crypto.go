package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
	"strings"
)

// TokenEncPrefix marks encrypted access tokens stored in DB.
const TokenEncPrefix = "v1:"

func EncryptTokenV1(key []byte, token string) (string, error) {
	if len(key) != 32 {
		return "", errors.New("invalid access token key length")
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := gcm.Seal(nil, nonce, []byte(token), nil)
	payload := append(nonce, ciphertext...)
	return TokenEncPrefix + base64.StdEncoding.EncodeToString(payload), nil
}

func DecryptTokenV1(key []byte, stored string) (string, error) {
	if len(key) != 32 {
		return "", errors.New("invalid access token key length")
	}
	if !strings.HasPrefix(stored, TokenEncPrefix) {
		return "", errors.New("missing token prefix")
	}

	payload, err := base64.StdEncoding.DecodeString(strings.TrimPrefix(stored, TokenEncPrefix))
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonceSize := gcm.NonceSize()
	if len(payload) < nonceSize {
		return "", errors.New("invalid token payload")
	}

	nonce := payload[:nonceSize]
	ciphertext := payload[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}
	return string(plaintext), nil
}
