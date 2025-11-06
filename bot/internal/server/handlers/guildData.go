package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/Sush1sui/fns-tickets/internal/bot"
	"github.com/Sush1sui/fns-tickets/internal/config"
	"github.com/bwmarrin/discordgo"
)

type GuildDataResponse struct {
	Roles      []Role     `json:"roles"`
	Categories []Category `json:"categories"`
	Channels   []Channel  `json:"channels"`
}

// GetGuildDataHandler returns roles, categories, and channels in a single request
func GetGuildDataHandler(w http.ResponseWriter, r *http.Request) {
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

	// Extract guild ID from URL path: /api/guilds/{guildId}/data
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

	// Fetch roles
	roles, err := sess.GuildRoles(guildID)
	if err != nil {
		http.Error(w, "Failed to fetch guild roles", http.StatusInternalServerError)
		return
	}

	// Fetch channels
	channels, err := sess.GuildChannels(guildID)
	if err != nil {
		http.Error(w, "Failed to fetch guild channels", http.StatusInternalServerError)
		return
	}

	// Filter and format roles (exclude @everyone)
	var roleList []Role
	for _, role := range roles {
		// Skip @everyone role (its ID equals the guild ID)
		if role.ID == guildID {
			continue
		}
		roleList = append(roleList, Role{
			RoleID:   role.ID,
			RoleName: role.Name,
		})
	}

	// Filter and format categories
	var categoryList []Category
	for _, ch := range channels {
		if ch.Type == discordgo.ChannelTypeGuildCategory {
			categoryList = append(categoryList, Category{
				CategoryID:   ch.ID,
				CategoryName: ch.Name,
			})
		}
	}

	// Filter and format channels (text and announcement only)
	var channelList []Channel
	for _, ch := range channels {
		if ch.Type == discordgo.ChannelTypeGuildText || ch.Type == discordgo.ChannelTypeGuildNews {
			channelList = append(channelList, Channel{
				ChannelID:   ch.ID,
				ChannelName: ch.Name,
			})
		}
	}

	// Build response
	response := GuildDataResponse{
		Roles:      roleList,
		Categories: categoryList,
		Channels:   channelList,
	}

	// Return JSON response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
