package events

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/Sush1sui/fns-tickets/internal/config"
	"github.com/Sush1sui/fns-tickets/internal/repository"
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

	// Fetch guild configuration
	guildConfig, err := repository.GetGuildConfig(i.GuildID)
	if err != nil {
		log.Printf("Error fetching guild config: %v", err)
		s.InteractionResponseEdit(i.Interaction, &discordgo.WebhookEdit{
			Content: strPtr("Failed to fetch server configuration. Please try again later."),
		})
		return
	}

	// Check max tickets per user
	if guildConfig.TicketConfig.MaxTicketsPerUser > 0 {
		activeTickets, err := repository.GetUserActiveTicketCount(i.GuildID, i.Member.User.ID)
		if err != nil {
			log.Printf("Error checking user ticket count: %v", err)
			s.InteractionResponseEdit(i.Interaction, &discordgo.WebhookEdit{
				Content: strPtr("Failed to verify ticket limit. Please try again later."),
			})
			return
		}

		if activeTickets >= guildConfig.TicketConfig.MaxTicketsPerUser {
			s.InteractionResponseEdit(i.Interaction, &discordgo.WebhookEdit{
				Content: strPtr(fmt.Sprintf("You have reached the maximum number of open tickets (%d). Please close an existing ticket before opening a new one.", guildConfig.TicketConfig.MaxTicketsPerUser)),
			})
			return
		}
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

	// Build user permissions based on ticket permissions config
	var userPerms int64 = discordgo.PermissionViewChannel | discordgo.PermissionSendMessages | discordgo.PermissionReadMessageHistory
	
	if guildConfig.TicketConfig.TicketPermissions.Attachments {
		userPerms |= discordgo.PermissionAttachFiles
	}
	if guildConfig.TicketConfig.TicketPermissions.Links {
		userPerms |= discordgo.PermissionEmbedLinks
	}
	if guildConfig.TicketConfig.TicketPermissions.Reactions {
		userPerms |= discordgo.PermissionAddReactions
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
				Allow: userPerms,
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

	// Save ticket to database
	ticket := &repository.Ticket{
		GuildID:   i.GuildID,
		ChannelID: channel.ID,
		UserID:    i.Member.User.ID,
		PanelID:   panelID,
	}
	if err := repository.CreateTicket(ticket); err != nil {
		log.Printf("Error saving ticket to database: %v", err)
		// Continue anyway, ticket channel is created
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
	var mentions *string
	if len(panelData.MentionOnOpen) > 0 {
		mentionStrs := make([]string, len(panelData.MentionOnOpen))
		for i, roleID := range panelData.MentionOnOpen {
			mentionStrs[i] = fmt.Sprintf("<@&%s>", roleID)
		}
		mentionStr := strings.Join(mentionStrs, " ")
		mentions = &mentionStr
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

	// Build message send
	messageSend := &discordgo.MessageSend{
		Embeds: []*discordgo.MessageEmbed{embed},
		Components: []discordgo.MessageComponent{
			discordgo.ActionsRow{
				Components: []discordgo.MessageComponent{closeButton},
			},
		},
	}
	
	// Only add content if there are mentions
	if mentions != nil {
		messageSend.Content = *mentions
	}

	// Send message
	_, err := s.ChannelMessageSendComplex(channelID, messageSend)

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

	// Mark ticket as closed in database
	if err := repository.CloseTicket(i.ChannelID); err != nil {
		log.Printf("Error closing ticket in database: %v", err)
		// Continue anyway
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
