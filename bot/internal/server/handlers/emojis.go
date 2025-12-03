package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/Sush1sui/fns-tickets/internal/bot"
	"github.com/Sush1sui/fns-tickets/internal/config"
)

type Emoji struct {
	EmojiID       string `json:"emojiId"`
	EmojiName     string `json:"emojiName"`
	EmojiAnimated bool   `json:"emojiAnimated"`
	EmojiURL      string `json:"emojiUrl"`
	EmojiFormat   string `json:"emojiFormat"` // Format like <:name:id> or <a:name:id>
}

// GetGuildEmojisHandler returns all custom emojis in a guild
func GetGuildEmojisHandler(w http.ResponseWriter, r *http.Request) {
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

	// Extract guild ID from URL path: /api/guilds/{guildId}/emojis
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

	// Format response using cached emojis
	var customEmojis []Emoji
	for _, emoji := range guild.Emojis {
		// Build emoji URL
		extension := "png"
		if emoji.Animated {
			extension = "gif"
		}
		emojiURL := "https://cdn.discordapp.com/emojis/" + emoji.ID + "." + extension

		// Build emoji format string
		prefix := ":"
		if emoji.Animated {
			prefix = "a:"
		}
		emojiFormat := "<" + prefix + emoji.Name + ":" + emoji.ID + ">"

		customEmojis = append(customEmojis, Emoji{
			EmojiID:       emoji.ID,
			EmojiName:     emoji.Name,
			EmojiAnimated: emoji.Animated,
			EmojiURL:      emojiURL,
			EmojiFormat:   emojiFormat,
		})
	}

	// Return JSON response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(customEmojis)
}
