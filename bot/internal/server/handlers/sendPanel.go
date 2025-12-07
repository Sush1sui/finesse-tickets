package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/Sush1sui/fns-tickets/internal/bot"
	"github.com/Sush1sui/fns-tickets/internal/config"
	"github.com/bwmarrin/discordgo"
)

type SendPanelRequest struct {
	PanelID     string  `json:"panelId"`
	ServerID    string  `json:"serverId"`
	ChannelID   string  `json:"channelId"`
	Title       string  `json:"title"`
	Content     string  `json:"content"`
	Color       string  `json:"color"`
	BtnColor    string  `json:"btnColor"`
	BtnText     string  `json:"btnText"`
	BtnEmoji    *string `json:"btnEmoji"`
	LargeImgUrl *string `json:"largeImgUrl"`
	SmallImgUrl *string `json:"smallImgUrl"`
}

type SendPanelResponse struct {
	MessageID string `json:"messageId"`
}

func SendPanelHandler(w http.ResponseWriter, r *http.Request) {
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

	var req SendPanelRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	s := bot.GetSession()
	if s == nil {
		http.Error(w, "Bot session not ready", http.StatusServiceUnavailable)
		return
	}

	// Parse color from hex string to int
	colorInt, err := strconv.ParseInt(req.Color[1:], 16, 64)
	if err != nil {
		colorInt = 0x5865F2 // Default Discord blurple
	}

	// Create embed
	embed := &discordgo.MessageEmbed{
		Title:       req.Title,
		Description: req.Content,
		Color:       int(colorInt),
	}

	if req.LargeImgUrl != nil && *req.LargeImgUrl != "" {
		embed.Image = &discordgo.MessageEmbedImage{URL: *req.LargeImgUrl}
	}

	if req.SmallImgUrl != nil && *req.SmallImgUrl != "" {
		embed.Thumbnail = &discordgo.MessageEmbedThumbnail{URL: *req.SmallImgUrl}
	}

	// Map button color
	var btnStyle discordgo.ButtonStyle
	switch req.BtnColor {
	case "blue":
		btnStyle = discordgo.PrimaryButton
	case "green":
		btnStyle = discordgo.SuccessButton
	case "red":
		btnStyle = discordgo.DangerButton
	case "gray":
		btnStyle = discordgo.SecondaryButton
	default:
		btnStyle = discordgo.PrimaryButton
	}

	// Create button with custom ID that includes panel ID
	button := discordgo.Button{
		Label:    req.BtnText,
		Style:    btnStyle,
		CustomID: fmt.Sprintf("open_ticket_%s", req.PanelID),
	}

	if req.BtnEmoji != nil && *req.BtnEmoji != "" {
		button.Emoji = &discordgo.ComponentEmoji{
			Name: *req.BtnEmoji,
		}
	}

	// Send message with embed and button
	msg, err := s.ChannelMessageSendComplex(req.ChannelID, &discordgo.MessageSend{
		Embeds: []*discordgo.MessageEmbed{embed},
		Components: []discordgo.MessageComponent{
			discordgo.ActionsRow{
				Components: []discordgo.MessageComponent{button},
			},
		},
	})

	if err != nil {
		log.Printf("Error sending panel: %v", err)
		http.Error(w, fmt.Sprintf("Failed to send panel: %v", err), http.StatusInternalServerError)
		return
	}

	// Return success with message ID
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(SendPanelResponse{
		MessageID: msg.ID,
	})
}
