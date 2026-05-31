package serverconfig

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/Sush1sui/FNS_BOT/internal/bot"
	"github.com/Sush1sui/FNS_BOT/internal/db"
	"github.com/Sush1sui/FNS_BOT/internal/utils"
	"github.com/jackc/pgx/v5/pgtype"
)



func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func validateServerConfigForm(f FormData) utils.ValidationErrors {
	errs := make(utils.ValidationErrors)
	utils.ValidateMaxLength(f.TicketNameStyle, "TicketNameStyle", 32, errs)
	utils.ValidateIntRange(f.MaxTicketsPerUser, "MaxTicketsPerUser", 1, 100, errs)
	utils.ValidateIntRange(f.AutoCloseNoResponseDays, "AutoCloseNoResponseDays", 0, 365, errs)
	utils.ValidateIntRange(f.AutoCloseNoResponseHours, "AutoCloseNoResponseHours", 0, 23, errs)
	utils.ValidateIntRange(f.AutoCloseNoResponseMins, "AutoCloseNoResponseMins", 0, 59, errs)
	utils.ValidateIntRange(f.AutoCloseSinceLastMessageDays, "AutoCloseSinceLastMessageDays", 0, 365, errs)
	utils.ValidateIntRange(f.AutoCloseSinceLastMessageHours, "AutoCloseSinceLastMessageHours", 0, 23, errs)
	utils.ValidateIntRange(f.AutoCloseSinceLastMessageMins, "AutoCloseSinceLastMessageMins", 0, 59, errs)
	return errs
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

	if errs := validateServerConfigForm(form); len(errs) > 0 {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "validation failed", "fields": errs})
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
		log.Printf("failed to save config: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save config"})
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
		log.Printf("failed to save auto close config: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save auto close config"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "saved"})
}
