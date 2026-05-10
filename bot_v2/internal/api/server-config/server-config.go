package serverconfig

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Sush1sui/FNS_BOT/internal/db"
)

// Handler handles HTTP endpoints for server configuration
type Handler struct {
	DB *db.Queries
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func (h *Handler) HandleGetServerConfig(w http.ResponseWriter, r *http.Request) {
	serverIDStr := r.PathValue("server_id")
	serverID, err := strconv.ParseInt(serverIDStr, 10, 64)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid Server ID"})
		return
	}

	config, err := h.DB.GetServerConfig(context.Background(), serverID)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Config not found"})
		return
	}

	writeJSON(w, http.StatusOK, config)
}

func (h *Handler) HandleUpdateServerConfig(w http.ResponseWriter, r *http.Request) {
	serverIDStr := r.PathValue("server_id")
	serverID, err := strconv.ParseInt(serverIDStr, 10, 64)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid Server ID"})
		return
	}

	var req db.UpsertServerConfigParams
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON body"})
		return
	}

	req.ID = serverID
	updatedConfig, err := h.DB.UpsertServerConfig(context.Background(), req)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to save configuration"})
		return
	}

	writeJSON(w, http.StatusOK, updatedConfig)
}
