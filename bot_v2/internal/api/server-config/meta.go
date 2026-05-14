package serverconfig

import (
	"net/http"

	"github.com/Sush1sui/FNS_BOT/internal/bot"
	"github.com/Sush1sui/FNS_BOT/internal/utils"
)

func (h *Handler) HandleGetRoles(w http.ResponseWriter, r *http.Request) {
	serverID := r.PathValue("server_id")

	roles, ok := utils.GetGuildRolesCache(bot.Session, serverID)
	if !ok {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "bot cache not ready"})
		return
	}
	writeJSON(w, http.StatusOK, roles)
}

func (h *Handler) HandleGetMeta(w http.ResponseWriter, r *http.Request) {
	serverID := r.PathValue("server_id")

	roles, ok := utils.GetGuildRolesCache(bot.Session, serverID)
	if !ok {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "bot cache not ready"})
		return
	}

	channels, ok := utils.GetGuildChannelsCache(bot.Session, serverID)
	if !ok {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "bot cache not ready"})
		return
	}

	categories := make([]utils.DiscordChannel, 0)
	for _, ch := range channels {
		if ch.Type == utils.ChannelTypeCategory {
			categories = append(categories, ch)
		}
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"roles":      roles,
		"channels":   channels,
		"categories": categories,
	})
}

func (h *Handler) HandleGetChannels(w http.ResponseWriter, r *http.Request) {
	serverID := r.PathValue("server_id")

	channels, ok := utils.GetGuildChannelsCache(bot.Session, serverID)
	if !ok {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "bot cache not ready"})
		return
	}
	writeJSON(w, http.StatusOK, channels)
}

func (h *Handler) HandleGetCategories(w http.ResponseWriter, r *http.Request) {
	serverID := r.PathValue("server_id")

	channels, ok := utils.GetGuildChannelsCache(bot.Session, serverID)
	if !ok {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "bot cache not ready"})
		return
	}

	categories := make([]utils.DiscordChannel, 0)
	for _, ch := range channels {
		if ch.Type == utils.ChannelTypeCategory {
			categories = append(categories, ch)
		}
	}
	writeJSON(w, http.StatusOK, categories)
}

func (h *Handler) HandleGetEmojis(w http.ResponseWriter, r *http.Request) {
	serverID := r.PathValue("server_id")

	emojis, ok := utils.GetGuildEmojisCache(bot.Session, serverID)
	if !ok {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "bot cache not ready"})
		return
	}
	writeJSON(w, http.StatusOK, emojis)
}
