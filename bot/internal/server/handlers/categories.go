package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/Sush1sui/fns-tickets/internal/bot"
	"github.com/Sush1sui/fns-tickets/internal/config"
	"github.com/bwmarrin/discordgo"
)

type Category struct {
	CategoryID   string `json:"categoryId"`
	CategoryName string `json:"categoryName"`
}

func GetGuildCategoriesHandler(w http.ResponseWriter, r *http.Request) {
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

	// Extract guild ID from URL path: /api/guilds/{guildId}/categories
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

	// Fetch all channels from Discord API
	channels, err := sess.GuildChannels(guildID)
	if err != nil {
		http.Error(w, "Failed to fetch channels", http.StatusInternalServerError)
		return
	}

	// Filter for category channels only (type 4)
	var response []Category
	for _, channel := range channels {
		if channel.Type == discordgo.ChannelTypeGuildCategory {
			response = append(response, Category{
				CategoryID:   channel.ID,
				CategoryName: channel.Name,
			})
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
