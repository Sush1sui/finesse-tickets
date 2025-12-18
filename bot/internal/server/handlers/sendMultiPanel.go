package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/Sush1sui/fns-tickets/internal/bot"
	"github.com/Sush1sui/fns-tickets/internal/config"
	"github.com/bwmarrin/discordgo"
)

type PanelInfo struct {
	ID       string  `json:"id"`
	Title    string  `json:"title"`
	BtnText  string  `json:"btnText"`
	BtnColor string  `json:"btnColor"`
	BtnEmoji *string `json:"btnEmoji"`
}

type EmbedInfo struct {
	Color        string  `json:"color"`
	Title        *string `json:"title"`
	Description  *string `json:"description"`
	Author       *struct {
		Name    string  `json:"name"`
		URL     *string `json:"url"`
		IconURL *string `json:"iconURL"`
	} `json:"author"`
	Image *struct {
		URL string `json:"url"`
	} `json:"image"`
	Thumbnail *struct {
		URL string `json:"url"`
	} `json:"thumbnail"`
	Footer *struct {
		Text    string  `json:"text"`
		IconURL *string `json:"iconURL"`
	} `json:"footer"`
}

type SendMultiPanelRequest struct {
	GuildID             string      `json:"guildId"`
	ChannelID           string      `json:"channelId"`
	Panels              []PanelInfo `json:"panels"`
	UseDropdown         bool        `json:"useDropdown"`
	DropdownPlaceholder string      `json:"dropdownPlaceholder"`
	Embed               EmbedInfo   `json:"embed"`
}

type SendMultiPanelResponse struct {
	MessageID string `json:"messageId"`
}

func SendMultiPanelHandler(w http.ResponseWriter, r *http.Request) {
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

	var req SendMultiPanelRequest
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
	colorInt, err := strconv.ParseInt(req.Embed.Color[1:], 16, 64)
	if err != nil {
		colorInt = 0x5865F2 // Default Discord blurple
	}

	// Create embed
	embed := &discordgo.MessageEmbed{
		Color: int(colorInt),
	}

	// Add title if provided
	if req.Embed.Title != nil && *req.Embed.Title != "" {
		embed.Title = *req.Embed.Title
	}

	// Discord requires at least a description or title
	if req.Embed.Description != nil && *req.Embed.Description != "" {
		embed.Description = *req.Embed.Description
	} else if embed.Title == "" {
		// Only add default description if no title is provided
		embed.Description = "Select an option below to open a ticket."
	}

	if req.Embed.Author != nil && req.Embed.Author.Name != "" {
		embed.Author = &discordgo.MessageEmbedAuthor{
			Name: req.Embed.Author.Name,
		}
		if req.Embed.Author.URL != nil && *req.Embed.Author.URL != "" {
			embed.Author.URL = *req.Embed.Author.URL
		}
		if req.Embed.Author.IconURL != nil && *req.Embed.Author.IconURL != "" {
			embed.Author.IconURL = *req.Embed.Author.IconURL
		}
	}

	if req.Embed.Image != nil && req.Embed.Image.URL != "" {
		embed.Image = &discordgo.MessageEmbedImage{URL: req.Embed.Image.URL}
	}

	if req.Embed.Thumbnail != nil && req.Embed.Thumbnail.URL != "" {
		embed.Thumbnail = &discordgo.MessageEmbedThumbnail{URL: req.Embed.Thumbnail.URL}
	}

	if req.Embed.Footer != nil && req.Embed.Footer.Text != "" {
		embed.Footer = &discordgo.MessageEmbedFooter{
			Text: req.Embed.Footer.Text,
		}
		if req.Embed.Footer.IconURL != nil && *req.Embed.Footer.IconURL != "" {
			embed.Footer.IconURL = *req.Embed.Footer.IconURL
		}
	}

	var components []discordgo.MessageComponent

	if req.UseDropdown {
		// Create select menu
		options := make([]discordgo.SelectMenuOption, 0, len(req.Panels))
		for _, panel := range req.Panels {
			option := discordgo.SelectMenuOption{
				Label: panel.Title,
				Value: panel.ID,
			}

			// Add emoji if present
			if panel.BtnEmoji != nil && *panel.BtnEmoji != "" {
				emojiStr := *panel.BtnEmoji
				if len(emojiStr) > 2 && emojiStr[0] == '<' && emojiStr[len(emojiStr)-1] == '>' {
					// Parse custom emoji
					parts := strings.Split(emojiStr[1:len(emojiStr)-1], ":")
					if len(parts) >= 3 {
						option.Emoji = &discordgo.ComponentEmoji{
							Name:     parts[1],
							ID:       parts[2],
							Animated: parts[0] == "a",
						}
					}
				} else {
					// Unicode emoji
					option.Emoji = &discordgo.ComponentEmoji{
						Name: emojiStr,
					}
				}
			}

			options = append(options, option)
		}

		placeholder := req.DropdownPlaceholder
		if placeholder == "" {
			placeholder = "Select a panel..."
		}

		components = []discordgo.MessageComponent{
			discordgo.ActionsRow{
				Components: []discordgo.MessageComponent{
					discordgo.SelectMenu{
						CustomID:    "select_panel",
						Placeholder: placeholder,
						Options:     options,
					},
				},
			},
		}
	} else {
		// Create buttons (max 5 per row)
		buttons := make([]discordgo.MessageComponent, 0)
		currentRow := make([]discordgo.MessageComponent, 0, 5)

		for i, panel := range req.Panels {
			// Map button color
			var btnStyle discordgo.ButtonStyle
			switch panel.BtnColor {
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

			button := discordgo.Button{
				Label:    panel.BtnText,
				Style:    btnStyle,
				CustomID: fmt.Sprintf("open_ticket_%s", panel.ID),
			}

			// Add emoji if present
			if panel.BtnEmoji != nil && *panel.BtnEmoji != "" {
				emojiStr := *panel.BtnEmoji
				if len(emojiStr) > 2 && emojiStr[0] == '<' && emojiStr[len(emojiStr)-1] == '>' {
					// Parse custom emoji
					parts := strings.Split(emojiStr[1:len(emojiStr)-1], ":")
					if len(parts) >= 3 {
						button.Emoji = &discordgo.ComponentEmoji{
							Name:     parts[1],
							ID:       parts[2],
							Animated: parts[0] == "a",
						}
					}
				} else {
					// Unicode emoji
					button.Emoji = &discordgo.ComponentEmoji{
						Name: emojiStr,
					}
				}
			}

			currentRow = append(currentRow, button)

			// If we have 5 buttons or it's the last panel, create a new row
			if len(currentRow) == 5 || i == len(req.Panels)-1 {
				buttons = append(buttons, discordgo.ActionsRow{
					Components: currentRow,
				})
				currentRow = make([]discordgo.MessageComponent, 0, 5)
			}
		}

		components = buttons
	}

	// Send message with embed and components
	msg, err := s.ChannelMessageSendComplex(req.ChannelID, &discordgo.MessageSend{
		Embeds:     []*discordgo.MessageEmbed{embed},
		Components: components,
	})

	if err != nil {
		log.Printf("Error sending multi-panel: %v", err)
		http.Error(w, fmt.Sprintf("Failed to send multi-panel: %v", err), http.StatusInternalServerError)
		return
	}

	// Return success with message ID
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(SendMultiPanelResponse{
		MessageID: msg.ID,
	})
}
