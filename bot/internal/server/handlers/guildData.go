package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/Sush1sui/fns-tickets/internal/bot"
	"github.com/Sush1sui/fns-tickets/internal/config"
	"github.com/bwmarrin/discordgo"
)

type GuildInfo struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Icon string `json:"icon"`
}

type GuildDataResponse struct {
	Guild      GuildInfo  `json:"guild"`
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

	// Filter and format roles (exclude @everyone)
	var roleList []Role
	for _, role := range guild.Roles {
		// Skip @everyone role (its ID equals the guild ID)
		if role.ID == guildID {
			continue
		}
		roleList = append(roleList, Role{
			RoleID:   role.ID,
			RoleName: role.Name,
		})
	}

	// Filter and format categories and channels from guild.Channels
	var categoryList []Category
	var channelList []Channel
	for _, ch := range guild.Channels {
		if ch.Type == discordgo.ChannelTypeGuildCategory {
			categoryList = append(categoryList, Category{
				CategoryID:   ch.ID,
				CategoryName: ch.Name,
			})
		} else if ch.Type == discordgo.ChannelTypeGuildText || ch.Type == discordgo.ChannelTypeGuildNews {
			channelList = append(channelList, Channel{
				ChannelID:   ch.ID,
				ChannelName: ch.Name,
			})
		}
	}

	// Build response
	response := GuildDataResponse{
		Guild: GuildInfo{
			ID:   guild.ID,
			Name: guild.Name,
			Icon: guild.Icon,
		},
		Roles:      roleList,
		Categories: categoryList,
		Channels:   channelList,
	}

	// Return JSON response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
