package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/Sush1sui/fns-tickets/internal/bot"
	"github.com/Sush1sui/fns-tickets/internal/config"
)

type Role struct {
	RoleID   string `json:"roleId"`
	RoleName string `json:"roleName"`
}

func GetGuildRolesHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow GET requests
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Verify API key
	apiKey := r.Header.Get("X-API-Key")
	if apiKey != config.GlobalConfig.BotAPIKey {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Extract guild ID from URL path: /api/guilds/{guildId}/roles
	pathParts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(pathParts) < 3 {
		http.Error(w, "Invalid guild ID", http.StatusBadRequest)
		return
	}
	guildID := pathParts[2]

	// Get Discord session
	sess := bot.GetSession()
	if sess == nil {
		http.Error(w, "Bot not ready", http.StatusServiceUnavailable)
		return
	}

	// Try to get guild from cache first (much faster)
	guild, err := sess.State.Guild(guildID)
	if err != nil {
		// Fallback to API call if not in cache
		guild, err = sess.Guild(guildID)
		if err != nil {
			http.Error(w, "Failed to fetch guild", http.StatusInternalServerError)
			return
		}
	}

	// Map to response structure
	var response []Role
	for _, role := range guild.Roles {
		// Skip @everyone role
		if role.ID == guildID {
			continue
		}
		response = append(response, Role{
			RoleID:   role.ID,
			RoleName: role.Name,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
