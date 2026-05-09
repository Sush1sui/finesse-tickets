package api

import (
	"net/http"

	"github.com/Sush1sui/FNS_BOT/internal/config"
	"github.com/Sush1sui/FNS_BOT/internal/db"
	"github.com/Sush1sui/FNS_BOT/internal/storage"
)

func NewRouter(queries *db.Queries, storageClient *storage.Client, cfg *config.Config) http.Handler {
	s := &Server{
		DB:      queries,
		Storage: storageClient,
		Config:  cfg,
	}

	mux := http.NewServeMux()

	// Public Routes
	mux.HandleFunc("GET /health", s.handleHealth)

	// API Routes for Server Config
	mux.HandleFunc("GET /api/config/{server_id}", s.handleGetServerConfig)
	mux.HandleFunc("PUT /api/config/{server_id}", s.handleUpdateServerConfig)

	// Auth Routes
	mux.HandleFunc("GET /api/auth/login", s.handleAuthLogin)
	mux.HandleFunc("GET /api/auth/callback", s.handleAuthCallback)
	mux.HandleFunc("GET /api/auth/me", s.handleAuthMe)
	mux.HandleFunc("GET /api/auth/servers", s.handleAuthServers)
	mux.HandleFunc("POST /api/auth/logout", s.handleAuthLogout)

	// Wrap the entire router with our CORS middleware
	return EnableCORS(mux, cfg.ClientOrigin, true)
}
