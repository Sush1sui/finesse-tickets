package serverconfig

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Sush1sui/FNS_BOT/internal/bot"
	"github.com/Sush1sui/FNS_BOT/internal/db"
	"github.com/Sush1sui/FNS_BOT/internal/utils"
)

type StaffMember struct {
	ID         string `json:"id"`
	Username   string `json:"username"`
	GlobalName string `json:"globalName"`
	AvatarURL  string `json:"avatarUrl"`
}

type StaffRole struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Color int    `json:"color"`
}

type StaffResponse struct {
	Members             []StaffMember `json:"members"`
	Roles               []StaffRole   `json:"roles"`
	AuthorizedMemberIds []string      `json:"authorizedMemberIds"`
	AuthorizedRoleIds   []string      `json:"authorizedRoleIds"`
}

type StaffUpdatePayload struct {
	AuthorizedMemberIds []string `json:"authorizedMemberIds"`
	AuthorizedRoleIds   []string `json:"authorizedRoleIds"`
}

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
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "server config not found"})
		return
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

	ctx := context.Background()

	_, err = h.DB.GetServerConfig(ctx, serverIDInt)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "server config not found"})
		return
	}

	if err := h.DB.ClearAuthorizedMembers(ctx, serverIDInt); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to clear members: " + err.Error()})
		return
	}

	if err := h.DB.ClearAuthorizedRoles(ctx, serverIDInt); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to clear roles: " + err.Error()})
		return
	}

	for _, mid := range payload.AuthorizedMemberIds {
		if err := h.DB.UpsertAuthorizedMember(ctx, db.UpsertAuthorizedMemberParams{
			ServerConfigID: serverIDInt,
			MemberID:       mid,
		}); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save member: " + err.Error()})
			return
		}
	}

	for _, rid := range payload.AuthorizedRoleIds {
		if err := h.DB.UpsertAuthorizedRole(ctx, db.UpsertAuthorizedRoleParams{
			ServerConfigID: serverIDInt,
			RoleID:         rid,
		}); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save role: " + err.Error()})
			return
		}
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "saved"})
}
