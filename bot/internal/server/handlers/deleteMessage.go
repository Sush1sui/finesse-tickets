package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/Sush1sui/fns-tickets/internal/bot"
	"github.com/Sush1sui/fns-tickets/internal/config"
)

type DeleteMessageRequest struct {
	ChannelID string `json:"channelId"`
	MessageID string `json:"messageId"`
}

func DeleteMessageHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Verify API secret
	authHeader := r.Header.Get("Authorization")
	expectedAuth := "Bearer " + config.GlobalConfig.BotAPIKey
	if authHeader != expectedAuth {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req DeleteMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	s := bot.GetSession()
	if s == nil {
		http.Error(w, "Bot session not ready", http.StatusServiceUnavailable)
		return
	}

	// Delete the message
	err := s.ChannelMessageDelete(req.ChannelID, req.MessageID)
	if err != nil {
		log.Printf("Error deleting message: %v", err)
		http.Error(w, "Failed to delete message", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}
