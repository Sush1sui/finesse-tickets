package events

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

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

// HandleButtonInteraction handles ticket panel button clicks and select menus
func HandleButtonInteraction(s *discordgo.Session, i *discordgo.InteractionCreate) {
	if i.Type != discordgo.InteractionMessageComponent {
		return
	}

	data := i.MessageComponentData()
	customID := data.CustomID
	
	// Check if it's a select menu for multi-panel
	if customID == "select_panel" {
		if len(data.Values) > 0 {
			panelID := data.Values[0]
			handleOpenTicket(s, i, panelID)
		}
		return
	}
	
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

	// Check if server has transcript channel configured and create transcript
	guildConfig, err = repository.GetGuildConfig(i.GuildID)
	if err != nil {
		log.Printf("Error fetching guild config for transcript check: %v", err)
	} else {
		log.Printf("Guild config fetched: %+v", guildConfig)
		if guildConfig != nil {
			if guildConfig.TicketConfig.TicketTranscript != nil {
				log.Printf("TicketTranscript value: '%s'", *guildConfig.TicketConfig.TicketTranscript)
			} else {
				log.Printf("TicketTranscript is nil")
			}
		}
		if guildConfig != nil && guildConfig.TicketConfig.TicketTranscript != nil && *guildConfig.TicketConfig.TicketTranscript != "" {
			log.Printf("Server has transcript channel configured: %s, creating transcript for ticket %s", *guildConfig.TicketConfig.TicketTranscript, ticket.ID.Hex())
			// Create transcript for this ticket
			transcript := &repository.Transcript{
				TicketID:     ticket.ID.Hex(),
				GuildID:      ticket.GuildID,
				ChannelID:    ticket.ChannelID,
				PanelID:      ticket.PanelID,
				UserID:       ticket.UserID,
				Username:     i.Member.User.Username,
				TicketNumber: 0, // You might want to implement a counter
				Messages:     []repository.TranscriptMessage{},
				Metadata: repository.TranscriptMetadata{
					TicketOpenedAt:   ticket.CreatedAt,
					TicketClosedAt:   ticket.CreatedAt, // Will be updated on close
					ClosedBy:         repository.TranscriptClosedBy{},
					TotalMessages:    0,
					TotalAttachments: 0,
					TotalEmbeds:      0,
					Participants:     []repository.TranscriptParticipant{},
				},
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			}
			if err := repository.CreateTranscript(transcript); err != nil {
				log.Printf("Error creating transcript: %v", err)
			} else {
				log.Printf("Successfully created transcript for ticket %s", ticket.ID.Hex())
			}
		} else {
			log.Printf("Server has no transcript channel configured, skipping transcript creation")
		}
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

	// Get guild config for transcript channel
	guildConfig, err := repository.GetGuildConfig(i.GuildID)
	if err != nil {
		log.Printf("Error fetching guild config: %v", err)
	}

	// Get ticket information
	ticket, err := repository.GetTicketByChannel(i.ChannelID)
	if err != nil {
		log.Printf("Error fetching ticket: %v", err)
	}

	// Check if transcript exists and needs to be finalized
	if ticket != nil {
		log.Printf("Processing transcript for ticket %s", ticket.ID.Hex())
		
		transcript, err := repository.GetTranscript(ticket.ID.Hex())
		if err != nil {
			log.Printf("Error checking transcript: %v", err)
		}
		
		if transcript == nil {
			log.Printf("No transcript found for ticket %s", ticket.ID.Hex())
		} else {
			log.Printf("Found transcript with %d messages", len(transcript.Messages))
			
			// Fetch all messages from the channel to ensure complete transcript
			messages, err := s.ChannelMessages(i.ChannelID, 100, "", "", "")
			if err != nil {
				log.Printf("Error fetching channel messages: %v", err)
			} else {
				log.Printf("Fetched %d messages from Discord channel", len(messages))
				// Add any missing messages to transcript (in reverse order)
				for j := len(messages) - 1; j >= 0; j-- {
					transcriptMsg := convertDiscordMessageToTranscript(messages[j])
					// Try to add, ignore errors if message already exists
					repository.AddMessageToTranscript(ticket.ID.Hex(), transcriptMsg)
				}
				
				// Re-fetch transcript to get updated message list
				transcript, err = repository.GetTranscript(ticket.ID.Hex())
				if err != nil {
					log.Printf("Error re-fetching transcript: %v", err)
				}
			}

			// Update transcript metadata with closing information
			closedBy := repository.TranscriptClosedBy{
				ID:       i.Member.User.ID,
				Username: i.Member.User.Username,
			}

			// Calculate final metadata - process even if no messages yet
			participantMap := make(map[string]*repository.TranscriptParticipant)
			totalAttachments := 0
			totalEmbeds := 0

			for _, msg := range transcript.Messages {
				if _, exists := participantMap[msg.Author.ID]; !exists {
					participantMap[msg.Author.ID] = &repository.TranscriptParticipant{
						ID:           msg.Author.ID,
						Username:     msg.Author.Username,
						MessageCount: 0,
					}
				}
				participantMap[msg.Author.ID].MessageCount++
				totalAttachments += len(msg.Attachments)
				totalEmbeds += len(msg.Embeds)
			}

			participants := make([]repository.TranscriptParticipant, 0, len(participantMap))
			for _, p := range participantMap {
				participants = append(participants, *p)
			}

			metadata := repository.TranscriptMetadata{
				TicketOpenedAt:   ticket.CreatedAt,
				TicketClosedAt:   time.Now(),
				ClosedBy:         closedBy,
				TotalMessages:    len(transcript.Messages),
				TotalAttachments: totalAttachments,
				TotalEmbeds:      totalEmbeds,
				Participants:     participants,
			}

			log.Printf("Updating transcript metadata: %d messages, %d participants", metadata.TotalMessages, len(metadata.Participants))

			if err := repository.UpdateTranscriptMetadata(ticket.ID.Hex(), metadata); err != nil {
				log.Printf("Error updating transcript metadata: %v", err)
			} else {
				log.Printf("Successfully saved transcript %s to database", ticket.ID.Hex())

				// Send transcript to configured channel if enabled
			if guildConfig != nil && guildConfig.TicketConfig.TicketTranscript != nil && *guildConfig.TicketConfig.TicketTranscript != "" {
				log.Printf("Sending transcript to channel %s", *guildConfig.TicketConfig.TicketTranscript)
				if err := sendTranscriptToChannel(s, *guildConfig.TicketConfig.TicketTranscript, ticket, transcript, metadata); err != nil {
						log.Printf("Error sending transcript to channel: %v", err)
					} else {
						log.Printf("Transcript sent successfully to channel")
					}
				} else {
					if guildConfig == nil {
						log.Printf("Guild config is nil, cannot send transcript")
				} else if guildConfig.TicketConfig.TicketTranscript == nil || *guildConfig.TicketConfig.TicketTranscript == "" {
						log.Printf("No transcript channel configured for this server")
					}
				}
			}
		}
	} else {
		log.Printf("Ticket is nil, cannot process transcript")
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

func sendTranscriptToChannel(s *discordgo.Session, channelID string, ticket *repository.Ticket, transcript *repository.Transcript, metadata repository.TranscriptMetadata) error {
	// Get user info
	user, err := s.User(ticket.UserID)
	if err != nil {
		return fmt.Errorf("failed to fetch user: %w", err)
	}

	// Format duration
	duration := metadata.TicketClosedAt.Sub(metadata.TicketOpenedAt)
	hours := int(duration.Hours())
	minutes := int(duration.Minutes()) % 60

	durationStr := fmt.Sprintf("%dh %dm", hours, minutes)
	if hours == 0 {
		durationStr = fmt.Sprintf("%dm", minutes)
	}

	// Format participants list
	participantsList := ""
	for i, p := range metadata.Participants {
		if i > 0 {
			participantsList += ", "
		}
		participantsList += fmt.Sprintf("<@%s>", p.ID)
	}

	// Get closed by user
	closedByUser, _ := s.User(metadata.ClosedBy.ID)
	closedByName := metadata.ClosedBy.Username
	if closedByUser != nil {
		closedByName = closedByUser.Username
	}

	// Create embed
	embed := &discordgo.MessageEmbed{
		Title:       fmt.Sprintf("Ticket Transcript - %s", user.Username),
		Description: fmt.Sprintf("Ticket for <@%s> has been closed.", ticket.UserID),
		Color:       0x5865F2,
		Fields: []*discordgo.MessageEmbedField{
			{
				Name:   "Ticket ID",
				Value:  ticket.ID.Hex(),
				Inline: true,
			},
			{
				Name:   "Opened At",
				Value:  fmt.Sprintf("<t:%d:F>", metadata.TicketOpenedAt.Unix()),
				Inline: true,
			},
			{
				Name:   "Closed At",
				Value:  fmt.Sprintf("<t:%d:F>", metadata.TicketClosedAt.Unix()),
				Inline: true,
			},
			{
				Name:   "Duration",
				Value:  durationStr,
				Inline: true,
			},
			{
				Name:   "Closed By",
				Value:  fmt.Sprintf("%s (<@%s>)", closedByName, metadata.ClosedBy.ID),
				Inline: true,
			},
			{
				Name:   "Total Messages",
				Value:  fmt.Sprintf("%d", metadata.TotalMessages),
				Inline: true,
			},
			{
				Name:   "Total Attachments",
				Value:  fmt.Sprintf("%d", metadata.TotalAttachments),
				Inline: true,
			},
			{
				Name:   "Total Embeds",
				Value:  fmt.Sprintf("%d", metadata.TotalEmbeds),
				Inline: true,
			},
			{
				Name:   "Participants",
				Value:  fmt.Sprintf("%d", len(metadata.Participants)),
				Inline: true,
			},
		},
		Footer: &discordgo.MessageEmbedFooter{
			Text: "View full transcript on the dashboard",
		},
		Timestamp: metadata.TicketClosedAt.Format(time.RFC3339),
	}

	if len(participantsList) > 0 && len(participantsList) < 1024 {
		embed.Fields = append(embed.Fields, &discordgo.MessageEmbedField{
			Name:   "All Participants",
			Value:  participantsList,
			Inline: false,
		})
	}

	// Send embed to transcript channel
	_, err = s.ChannelMessageSendEmbed(channelID, embed)
	if err != nil {
		return fmt.Errorf("failed to send transcript embed: %w", err)
	}

	log.Printf("Successfully sent transcript for ticket %s to channel %s", ticket.ID.Hex(), channelID)
	return nil
}