package api

import (
	"net/http"

	"github.com/Sush1sui/FNS_BOT/internal/db"
	"github.com/Sush1sui/FNS_BOT/internal/storage"
)

func NewRouter(queries *db.Queries, storageClient *storage.Client) http.Handler {
	s := &Server{
		DB:      queries,
		Storage: storageClient,
	}

	mux := http.NewServeMux()

	// Public Routes
	mux.HandleFunc("GET /health", s.handleHealth)

	// API Routes for Server Config
	mux.HandleFunc("GET /api/config/{server_id}", s.handleGetServerConfig)
	mux.HandleFunc("PUT /api/config/{server_id}", s.handleUpdateServerConfig)

	// Wrap the entire router with our CORS middleware
	return EnableCORS(mux)
}
