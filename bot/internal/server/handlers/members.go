package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/Sush1sui/fns-tickets/internal/bot"
	"github.com/Sush1sui/fns-tickets/internal/config"
)

type Member struct {
	UserID        string `json:"userId"`
	Username      string `json:"username"`
	Discriminator string `json:"discriminator"`
	DisplayName   string `json:"displayName"`
	Avatar        string `json:"avatar"`
	Bot           bool   `json:"bot"`
}

type MembersResponse struct {
	Members []Member `json:"members"`
}

// GetGuildMembersHandler returns all members of a guild
func GetGuildMembersHandler(w http.ResponseWriter, r *http.Request) {
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

	// Extract guild ID from URL path: /api/guilds/{guildId}/members
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

	// Fetch all guild members (this uses chunking for large guilds)
	members, err := sess.GuildMembers(guildID, "", 1000)
	if err != nil {
		http.Error(w, "Failed to fetch guild members", http.StatusInternalServerError)
		return
	}

	// Format member list
	var memberList []Member
	for _, member := range members {
		// Get display name (nickname or username)
		displayName := member.Nick
		if displayName == "" {
			displayName = member.User.Username
		}

		memberList = append(memberList, Member{
			UserID:        member.User.ID,
			Username:      member.User.Username,
			Discriminator: member.User.Discriminator,
			DisplayName:   displayName,
			Avatar:        member.User.Avatar,
			Bot:           member.User.Bot,
		})
	}

	// Build response
	response := MembersResponse{
		Members: memberList,
	}

	// Return JSON response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
