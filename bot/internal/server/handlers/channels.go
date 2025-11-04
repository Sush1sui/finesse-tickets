package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/Sush1sui/fns-tickets/internal/bot"
	"github.com/Sush1sui/fns-tickets/internal/config"
	"github.com/bwmarrin/discordgo"
)

type Channel struct {
	ChannelID   string `json:"channelId"`
	ChannelName string `json:"channelName"`
}

// GetGuildChannelsHandler returns all text channels in a guild
func GetGuildChannelsHandler(w http.ResponseWriter, r *http.Request) {
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

	// Extract guild ID from URL path: /api/guilds/{guildId}/channels
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

	// Fetch guild channels
	channels, err := sess.GuildChannels(guildID)
	if err != nil {
		http.Error(w, "Failed to fetch guild channels", http.StatusInternalServerError)
		return
	}

	// Filter for text channels only and format response
	var textChannels []Channel
	for _, ch := range channels {
		// Only include text channels (type 0) and announcement channels (type 5)
		if ch.Type == discordgo.ChannelTypeGuildText || ch.Type == discordgo.ChannelTypeGuildNews {
			textChannels = append(textChannels, Channel{
				ChannelID:   ch.ID,
				ChannelName: ch.Name,
			})
		}
	}

	// Return JSON response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(textChannels)
}
