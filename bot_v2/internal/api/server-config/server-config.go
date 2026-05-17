package serverconfig

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Sush1sui/FNS_BOT/internal/bot"
	"github.com/Sush1sui/FNS_BOT/internal/db"
	"github.com/Sush1sui/FNS_BOT/internal/utils"
	"github.com/jackc/pgx/v5/pgtype"
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

type TicketPermissions []string

type FormData struct {
	TicketNameStyle                  string `json:"TicketNameStyle"`
	TicketTranscripts                string `json:"TicketTranscripts"`
	MaxTicketsPerUser                int    `json:"MaxTicketsPerUser"`
	TicketPermissionsAttachFiles    bool   `json:"TicketPermissionsAttachFiles"`
	TicketPermissionsEmbedLinks     bool   `json:"TicketPermissionsEmbedLinks"`
	TicketPermissionsAddReactions  bool   `json:"TicketPermissionsAddReactions"`
	AutoClose                        bool   `json:"AutoClose"`
	AutoCloseOnUserLeave            bool   `json:"AutoCloseOnUserLeave"`
	AutoCloseNoResponseDays         int    `json:"AutoCloseNoResponseDays"`
	AutoCloseNoResponseHours        int    `json:"AutoCloseNoResponseHours"`
	AutoCloseNoResponseMins         int    `json:"AutoCloseNoResponseMins"`
	AutoCloseSinceLastMessageDays   int    `json:"AutoCloseSinceLastMessageDays"`
	AutoCloseSinceLastMessageHours  int    `json:"AutoCloseSinceLastMessageHours"`
	AutoCloseSinceLastMessageMins  int    `json:"AutoCloseSinceLastMessageMins"`
}

func (h *Handler) HandleGetServerConfig(w http.ResponseWriter, r *http.Request) {
	serverIDStr := r.PathValue("server_id")
	showChannels := r.URL.Query().Get("show_channels") == "true"

	serverID, err := strconv.ParseInt(serverIDStr, 10, 64)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid Server ID"})
		return
	}

	config, _ := h.DB.GetServerConfig(context.Background(), serverID)

	if showChannels {
		channels, _ := utils.GetGuildChannelsCache(bot.Session, serverIDStr)
		response := map[string]any{
			"config":   config,
			"channels": channels,
		}
		writeJSON(w, http.StatusOK, response)
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

	var form FormData
	if err := json.NewDecoder(r.Body).Decode(&form); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON body"})
		return
	}

	// Encode ticket permissions as JSON array of names (only true ones)
	var perms TicketPermissions
	if form.TicketPermissionsAttachFiles {
		perms = append(perms, "attachFiles")
	}
	if form.TicketPermissionsEmbedLinks {
		perms = append(perms, "embedLinks")
	}
	if form.TicketPermissionsAddReactions {
		perms = append(perms, "addReactions")
	}
	permsJSON, _ := json.Marshal(perms)

	// Upsert server config
	cfg, err := h.DB.UpsertServerConfig(context.Background(), db.UpsertServerConfigParams{
		ID:                  serverID,
		TicketNameStyle:     form.TicketNameStyle,
		TicketTranscriptCid: pgtype.Text{String: form.TicketTranscripts, Valid: form.TicketTranscripts != ""},
		MaxTicketPerUser:    int32(form.MaxTicketsPerUser),
		TicketPermissions:   permsJSON,
	})
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to save config: " + err.Error()})
		return
	}
	_ = cfg // use cfg to ensure it's read

	// Convert days/hours/mins to total minutes
	noResponseMins := int32((form.AutoCloseNoResponseDays * 24 * 60) + (form.AutoCloseNoResponseHours * 60) + form.AutoCloseNoResponseMins)
	sinceLastMessageMins := int32((form.AutoCloseSinceLastMessageDays * 24 * 60) + (form.AutoCloseSinceLastMessageHours * 60) + form.AutoCloseSinceLastMessageMins)

	// Upsert auto close config
	_, err = h.DB.UpsertAutoCloseConfig(context.Background(), db.UpsertAutoCloseConfigParams{
		ServerConfigID:                   serverID,
		IsActive:                         form.AutoClose,
		CloseOnUserLeave:                 form.AutoCloseOnUserLeave,
		CloseSinceOpenWithNoResponseMins: pgtype.Int4{Int32: noResponseMins, Valid: true},
		CloseSinceLastMessageMins:        pgtype.Int4{Int32: sinceLastMessageMins, Valid: true},
	})
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to save auto close config: " + err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "saved"})
}
