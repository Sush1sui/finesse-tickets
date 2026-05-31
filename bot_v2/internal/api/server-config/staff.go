package serverconfig

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"

	"github.com/Sush1sui/FNS_BOT/internal/bot"
	"github.com/Sush1sui/FNS_BOT/internal/db"
	"github.com/Sush1sui/FNS_BOT/internal/utils"
	"github.com/jackc/pgx/v5"
)

func (h *Handler) HandleGetStaff(w http.ResponseWriter, r *http.Request) {
	serverID := r.PathValue("server_id")

	serverIDInt, err := strconv.ParseInt(serverID, 10, 64)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid server id"})
		return
	}

	ctx := context.Background()

	_, err = h.DB.GetServerConfig(ctx, serverIDInt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			if err := h.DB.EnsureServerConfig(ctx, serverIDInt); err != nil {
				writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to initialize server config"})
				return
			}
		} else {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load server config"})
			return
		}
	}

	members, ok := utils.GetGuildMembersCache(bot.Session, serverID)
	if !ok {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "bot cache not ready"})
		return
	}

	roles, ok := utils.GetGuildRolesCache(bot.Session, serverID)
	if !ok {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "bot cache not ready"})
		return
	}

	authMemberIds, _ := h.DB.GetAuthorizedMembers(ctx, serverIDInt)
	authRoleIds, _ := h.DB.GetAuthorizedRoles(ctx, serverIDInt)

	staffMembers := make([]StaffMember, 0, len(members))

	var botID string
	if bot.Session != nil && bot.Session.State != nil && bot.Session.State.User != nil {
		botID = bot.Session.State.User.ID
	}

	for _, m := range members {
		if m.Bot || m.ID == botID {
			continue
		}
		avatarURL := ""
		if m.Avatar != "" {
			avatarURL = "https://cdn.discordapp.com/avatars/" + m.ID + "/" + m.Avatar + ".png"
		}
		staffMembers = append(staffMembers, StaffMember{
			ID:         m.ID,
			Username:   m.Username,
			GlobalName: m.GlobalName,
			AvatarURL:  avatarURL,
		})
	}

	staffRoles := make([]StaffRole, 0, len(roles))
	for _, r := range roles {
		staffRoles = append(staffRoles, StaffRole{
			ID:    r.ID,
			Name:  r.Name,
			Color: r.Color,
		})
	}

	resp := StaffResponse{
		Members:             staffMembers,
		Roles:               staffRoles,
		AuthorizedMemberIds: authMemberIds,
		AuthorizedRoleIds:   authRoleIds,
	}

	writeJSON(w, http.StatusOK, resp)
}

func validateStaffPayload(p StaffUpdatePayload) utils.ValidationErrors {
	errs := make(utils.ValidationErrors)
	if len(p.AuthorizedMemberIds) > 100 {
		errs["authorizedMemberIds"] = "max 100 members allowed"
	}
	if len(p.AuthorizedRoleIds) > 100 {
		errs["authorizedRoleIds"] = "max 100 roles allowed"
	}
	for _, id := range p.AuthorizedMemberIds {
		utils.ValidateSnowflake(id, "authorizedMemberIds", errs)
	}
	for _, id := range p.AuthorizedRoleIds {
		utils.ValidateSnowflake(id, "authorizedRoleIds", errs)
	}
	return errs
}

func (h *Handler) HandleUpdateStaff(w http.ResponseWriter, r *http.Request) {
	serverID := r.PathValue("server_id")

	serverIDInt, err := strconv.ParseInt(serverID, 10, 64)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid server id"})
		return
	}

	var payload StaffUpdatePayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json body"})
		return
	}

	if errs := validateStaffPayload(payload); len(errs) > 0 {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "validation failed", "fields": errs})
		return
	}

	ctx := context.Background()

	_, err = h.DB.GetServerConfig(ctx, serverIDInt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			if err := h.DB.EnsureServerConfig(ctx, serverIDInt); err != nil {
				writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to initialize server config"})
				return
			}
		} else {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load server config"})
			return
		}
	}

	if err := h.DB.ClearAuthorizedMembers(ctx, serverIDInt); err != nil {
		log.Printf("failed to clear members: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to clear members"})
		return
	}

	if err := h.DB.ClearAuthorizedRoles(ctx, serverIDInt); err != nil {
		log.Printf("failed to clear roles: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to clear roles"})
		return
	}

	for _, mid := range payload.AuthorizedMemberIds {
		if err := h.DB.UpsertAuthorizedMember(ctx, db.UpsertAuthorizedMemberParams{
			ServerConfigID: serverIDInt,
			MemberID:       mid,
		}); err != nil {
			log.Printf("failed to save member: %v", err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save member"})
			return
		}
	}

	for _, rid := range payload.AuthorizedRoleIds {
		if err := h.DB.UpsertAuthorizedRole(ctx, db.UpsertAuthorizedRoleParams{
			ServerConfigID: serverIDInt,
			RoleID:         rid,
		}); err != nil {
			log.Printf("failed to save role: %v", err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save role"})
			return
		}
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "saved"})
}
