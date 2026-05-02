// internal/storage/azure.go
package storage

import (
	"bytes"
	"context"
	"log"
	"os"
	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/storage/azblob"
	"github.com/Azure/azure-sdk-for-go/sdk/storage/azblob/blob" // Added specific blob package
	"github.com/Azure/azure-sdk-for-go/sdk/storage/azblob/sas"
)

type Client struct {
	client        *azblob.Client
	containerName string
	connStr       string // We will store this to spawn blob clients instantly
}

// NewAzureClient connects to your Azure Storage Account
func NewAzureClient() *Client {
	connStr := os.Getenv("AZURE_STORAGE_CONNECTION_STRING")
	containerName := os.Getenv("AZURE_STORAGE_CONTAINER")

	if connStr == "" || containerName == "" {
		log.Fatal("Missing AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_CONTAINER in .env")
	}

	// The root client is highly optimized for uploading streams
	client, err := azblob.NewClientFromConnectionString(connStr, nil)
	if err != nil {
		log.Fatalf("Failed to create Azure client: %v", err)
	}

	return &Client{
		client:        client,
		containerName: containerName,
		connStr:       connStr, // Save the connection string for SAS generation
	}
}

// UploadTranscript streams your minified JSON straight into Azure
func (c *Client) UploadTranscript(ctx context.Context, key string, data []byte) error {
	reader := bytes.NewReader(data)
	_, err := c.client.UploadStream(ctx, c.containerName, key, reader, &azblob.UploadStreamOptions{})
	return err
}

// GeneratePresignedURL creates a secure, 1-hour link for the React dashboard
func (c *Client) GeneratePresignedURL(key string) (string, error) {
	// 1. Create a client dedicated to this exact blob file
	blobClient, err := blob.NewClientFromConnectionString(c.connStr, c.containerName, key, nil)
	if err != nil {
		return "", err
	}

	// 2. Set Read-only permissions and 1-hour expiration
	permissions := sas.BlobPermissions{Read: true}
	expiry := time.Now().UTC().Add(1 * time.Hour)

	// 3. Generate the SAS URL directly from the blob client
	return blobClient.GetSASURL(permissions, expiry, nil)
}
