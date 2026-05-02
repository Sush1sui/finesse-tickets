// internal/api/handlers.go
package api

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Sush1sui/FNS_BOT/internal/db"
	"github.com/Sush1sui/FNS_BOT/internal/storage"
)

type Server struct {
	DB      *db.Queries
	Storage *storage.Client
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "API is flying 🚀"})
}

// Get the main server configuration
func (s *Server) handleGetServerConfig(w http.ResponseWriter, r *http.Request) {
	serverIDStr := r.PathValue("server_id")

	serverID, err := strconv.ParseInt(serverIDStr, 10, 64)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid Server ID"})
		return
	}

	config, err := s.DB.GetServerConfig(context.Background(), serverID)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Config not found"})
		return
	}

	writeJSON(w, http.StatusOK, config)
}

// Update the main server configuration
func (s *Server) handleUpdateServerConfig(w http.ResponseWriter, r *http.Request) {
	serverIDStr := r.PathValue("server_id")
	serverID, err := strconv.ParseInt(serverIDStr, 10, 64)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid Server ID"})
		return
	}

	// 1. Decode the JSON body from the frontend
	var req db.UpsertServerConfigParams
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON body"})
		return
	}

	// Force the ID from the URL just in case
	req.ID = serverID

	// 2. Save to database using our Upsert query
	updatedConfig, err := s.DB.UpsertServerConfig(context.Background(), req)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to save configuration"})
		return
	}

	// 3. Return the updated config
	writeJSON(w, http.StatusOK, updatedConfig)
}
