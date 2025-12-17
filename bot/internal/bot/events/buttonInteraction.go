package events

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/Sush1sui/fns-tickets/internal/config"
	"github.com/bwmarrin/discordgo"
)

type PanelData struct {
	PanelID         string                 `json:"panelId"`
	ServerID        string                 `json:"serverId"`
	MentionOnOpen   []string               `json:"mentionOnOpen"`
	TicketCategory  *string                `json:"ticketCategory"`
	WelcomeEmbed    *WelcomeEmbedData      `json:"welcomeEmbed"`
}

type WelcomeEmbedData struct {
	Color        string  `json:"color"`
	Title        *string `json:"title"`
	Description  *string `json:"description"`
	TitleImgUrl  *string `json:"titleImgUrl"`
	LargeImgUrl  *string `json:"largeImgUrl"`
	SmallImgUrl  *string `json:"smallImgUrl"`
	FooterText   *string `json:"footerText"`
	FooterImgUrl *string `json:"footerImgUrl"`
}

// HandleButtonInteraction handles ticket panel button clicks
func HandleButtonInteraction(s *discordgo.Session, i *discordgo.InteractionCreate) {
	if i.Type != discordgo.InteractionMessageComponent {
		return
	}

	customID := i.MessageComponentData().CustomID
	
	// Check if it's a ticket open button
	if strings.HasPrefix(customID, "open_ticket_") {
		panelID := strings.TrimPrefix(customID, "open_ticket_")
		handleOpenTicket(s, i, panelID)
		return
	}

	// Check if it's a close button
	if customID == "close_ticket" {
		handleCloseTicket(s, i)
		return
	}
}

func handleOpenTicket(s *discordgo.Session, i *discordgo.InteractionCreate, panelID string) {
	// Defer interaction response
	err := s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseDeferredChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Flags: discordgo.MessageFlagsEphemeral,
		},
	})
	if err != nil {
		log.Printf("Error responding to interaction: %v", err)
		return
	}

	// Fetch panel data from Next.js API
	nextAppURL := config.GlobalConfig.NextAppURL
	resp, err := http.Get(fmt.Sprintf("%s/api/panels/%s", nextAppURL, panelID))
	if err != nil {
		log.Printf("Error fetching panel data: %v", err)
		s.InteractionResponseEdit(i.Interaction, &discordgo.WebhookEdit{
			Content: strPtr("Failed to fetch panel data. Please try again later."),
		})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Panel data fetch returned status: %d", resp.StatusCode)
		s.InteractionResponseEdit(i.Interaction, &discordgo.WebhookEdit{
			Content: strPtr("Panel not found. Please contact an administrator."),
		})
		return
	}

	var panelData PanelData
	if err := json.NewDecoder(resp.Body).Decode(&panelData); err != nil {
		log.Printf("Error decoding panel data: %v", err)
		s.InteractionResponseEdit(i.Interaction, &discordgo.WebhookEdit{
			Content: strPtr("Error processing panel data. Please try again later."),
		})
		return
	}

	// Create ticket channel
	channelName := fmt.Sprintf("ticket-%s", i.Member.User.Username)
	
	// Get parent category if specified
	var parentID string
	if panelData.TicketCategory != nil {
		parentID = *panelData.TicketCategory
	}

	channel, err := s.GuildChannelCreateComplex(i.GuildID, discordgo.GuildChannelCreateData{
		Name:     channelName,
		Type:     discordgo.ChannelTypeGuildText,
		ParentID: parentID,
		PermissionOverwrites: []*discordgo.PermissionOverwrite{
			{
				ID:   i.GuildID, // @everyone
				Type: discordgo.PermissionOverwriteTypeRole,
				Deny: discordgo.PermissionViewChannel,
			},
			{
				ID:    i.Member.User.ID,
				Type:  discordgo.PermissionOverwriteTypeMember,
				Allow: discordgo.PermissionViewChannel | discordgo.PermissionSendMessages | discordgo.PermissionReadMessageHistory,
			},
		},
	})

	if err != nil {
		log.Printf("Error creating ticket channel: %v", err)
		s.InteractionResponseEdit(i.Interaction, &discordgo.WebhookEdit{
			Content: strPtr("Failed to create ticket channel. Please try again later."),
		})
		return
	}

	// Send welcome message
	sendWelcomeMessage(s, channel.ID, i.Member.User, panelData)

	// Update interaction response
	s.InteractionResponseEdit(i.Interaction, &discordgo.WebhookEdit{
		Content: strPtr(fmt.Sprintf("Ticket created! Please check <#%s>", channel.ID)),
	})
}

func sendWelcomeMessage(s *discordgo.Session, channelID string, user *discordgo.User, panelData PanelData) {
	var embed *discordgo.MessageEmbed
	
	if panelData.WelcomeEmbed != nil {
		// Custom welcome embed
		colorInt := parseColor(panelData.WelcomeEmbed.Color)
		
		// Use custom description if provided, otherwise use default
		description := fmt.Sprintf("Welcome %s! A staff member will assist you shortly.", user.Mention())
		if panelData.WelcomeEmbed.Description != nil && *panelData.WelcomeEmbed.Description != "" {
			description = *panelData.WelcomeEmbed.Description
		}
		
		embed = &discordgo.MessageEmbed{
			Color:       colorInt,
			Description: description,
		}

		if panelData.WelcomeEmbed.Title != nil {
			embed.Title = *panelData.WelcomeEmbed.Title
		}

		if panelData.WelcomeEmbed.TitleImgUrl != nil {
			embed.Author = &discordgo.MessageEmbedAuthor{
				IconURL: *panelData.WelcomeEmbed.TitleImgUrl,
			}
		}

		if panelData.WelcomeEmbed.LargeImgUrl != nil {
			embed.Image = &discordgo.MessageEmbedImage{URL: *panelData.WelcomeEmbed.LargeImgUrl}
		}

		if panelData.WelcomeEmbed.SmallImgUrl != nil {
			embed.Thumbnail = &discordgo.MessageEmbedThumbnail{URL: *panelData.WelcomeEmbed.SmallImgUrl}
		}

		if panelData.WelcomeEmbed.FooterText != nil {
			footer := &discordgo.MessageEmbedFooter{
				Text: *panelData.WelcomeEmbed.FooterText,
			}
			if panelData.WelcomeEmbed.FooterImgUrl != nil {
				footer.IconURL = *panelData.WelcomeEmbed.FooterImgUrl
			}
			embed.Footer = footer
		}
	} else {
		// Default welcome message
		embed = &discordgo.MessageEmbed{
			Title:       "Ticket Created",
			Description: fmt.Sprintf("Hello %s! Thank you for creating a ticket. A staff member will assist you shortly.", user.Mention()),
			Color:       0x5865F2, // Discord blurple
		}
	}

	// Build mentions string
	mentions := ""
	if len(panelData.MentionOnOpen) > 0 {
		mentionStrs := make([]string, len(panelData.MentionOnOpen))
		for i, roleID := range panelData.MentionOnOpen {
			mentionStrs[i] = fmt.Sprintf("<@&%s>", roleID)
		}
		mentions = strings.Join(mentionStrs, " ")
	}

	// Create close button
	closeButton := discordgo.Button{
		Label:    "Close Ticket",
		Style:    discordgo.DangerButton,
		CustomID: "close_ticket",
		Emoji: &discordgo.ComponentEmoji{
			Name: "🔒",
		},
	}

	// Send message
	_, err := s.ChannelMessageSendComplex(channelID, &discordgo.MessageSend{
		Content: mentions,
		Embeds:  []*discordgo.MessageEmbed{embed},
		Components: []discordgo.MessageComponent{
			discordgo.ActionsRow{
				Components: []discordgo.MessageComponent{closeButton},
			},
		},
	})

	if err != nil {
		log.Printf("Error sending welcome message: %v", err)
	}
}

func handleCloseTicket(s *discordgo.Session, i *discordgo.InteractionCreate) {
	// Respond to interaction
	err := s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: "Closing ticket...",
			Flags:   discordgo.MessageFlagsEphemeral,
		},
	})
	if err != nil {
		log.Printf("Error responding to close interaction: %v", err)
		return
	}

	// Delete the channel
	_, err = s.ChannelDelete(i.ChannelID)
	if err != nil {
		log.Printf("Error deleting ticket channel: %v", err)
		s.InteractionResponseEdit(i.Interaction, &discordgo.WebhookEdit{
			Content: strPtr("Failed to close ticket. Please contact an administrator."),
		})
	}
}

func parseColor(colorStr string) int {
	if len(colorStr) > 0 && colorStr[0] == '#' {
		colorStr = colorStr[1:]
	}
	
	var colorInt int64
	fmt.Sscanf(colorStr, "%x", &colorInt)
	if colorInt == 0 {
		return 0x5865F2 // Default to Discord blurple
	}
	return int(colorInt)
}

func strPtr(s string) *string {
	return &s
}
