package common

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/Sush1sui/fns-tickets/internal/config"
	"github.com/Sush1sui/fns-tickets/internal/repository"
	"github.com/bwmarrin/discordgo"
)

type QnA struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

func HandleOpenTicket(s *discordgo.Session, i *discordgo.InteractionCreate, panelID string, QuestionsAndAnswers []QnA) {
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

	var response struct {
		Panel PanelData `json:"panel"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		log.Printf("Error decoding panel data: %v", err)
		s.InteractionResponseEdit(i.Interaction, &discordgo.WebhookEdit{
			Content: strPtr("Error processing panel data. Please try again later."),
		})
		return
	}

	panelData := response.Panel

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

	// Build permission overwrites: deny @everyone, allow ticket opener, and allow staff roles/users and mention roles
	added := make(map[string]bool)
	var overwrites []*discordgo.PermissionOverwrite

	// Deny @everyone
	overwrites = append(overwrites, &discordgo.PermissionOverwrite{
		ID:   i.GuildID,
		Type: discordgo.PermissionOverwriteTypeRole,
		Deny: discordgo.PermissionViewChannel,
	})
	added[i.GuildID] = true

	// Allow the ticket opener
	overwrites = append(overwrites, &discordgo.PermissionOverwrite{
		ID:    i.Member.User.ID,
		Type:  discordgo.PermissionOverwriteTypeMember,
		Allow: userPerms,
	})
	added[i.Member.User.ID] = true

	// Staff permissions: allow viewing and interacting with the ticket
	var staffPerms int64 = discordgo.PermissionViewChannel | discordgo.PermissionSendMessages | discordgo.PermissionReadMessageHistory | discordgo.PermissionAddReactions | discordgo.PermissionAttachFiles | discordgo.PermissionEmbedLinks

	// Add staff roles from guild config
	if guildConfig != nil {
		// Add roles listed under ticketConfig.staffs.roles
		for _, roleID := range guildConfig.TicketConfig.Staffs.Roles {
			if roleID == "" {
				continue
			}
			if _, exists := added[roleID]; exists {
				continue
			}
			overwrites = append(overwrites, &discordgo.PermissionOverwrite{
				ID:    roleID,
				Type:  discordgo.PermissionOverwriteTypeRole,
				Allow: staffPerms,
			})
			added[roleID] = true
		}

		// Add individual staff users
		for _, userID := range guildConfig.TicketConfig.Staffs.Users {
			if userID == "" || userID == i.Member.User.ID {
				continue
			}
			if _, exists := added[userID]; exists {
				continue
			}
			overwrites = append(overwrites, &discordgo.PermissionOverwrite{
				ID:    userID,
				Type:  discordgo.PermissionOverwriteTypeMember,
				Allow: staffPerms,
			})
			added[userID] = true
		}
	}

	// Ensure any mentionOnOpen roles can see the channel (so mentions are useful)
	for _, roleID := range panelData.MentionOnOpen {
		if roleID == "" {
			continue
		}
		if _, exists := added[roleID]; exists {
			continue
		}
		overwrites = append(overwrites, &discordgo.PermissionOverwrite{
			ID:    roleID,
			Type:  discordgo.PermissionOverwriteTypeRole,
			Allow: staffPerms,
		})
		added[roleID] = true
	}

	channel, err := s.GuildChannelCreateComplex(i.GuildID, discordgo.GuildChannelCreateData{
		Name:                 channelName,
		Type:                 discordgo.ChannelTypeGuildText,
		ParentID:             parentID,
		PermissionOverwrites: overwrites,
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
		if guildConfig != nil && guildConfig.TicketConfig.TicketTranscript != nil && *guildConfig.TicketConfig.TicketTranscript != "" {
			// Create transcript for this ticket
			transcript := &repository.Transcript{
				TicketID:     ticket.ID.Hex(),
				GuildID:      ticket.GuildID,
				ChannelID:    ticket.ChannelID,
				PanelID:      ticket.PanelID,
				UserID:       ticket.UserID,
				Username:     i.Member.User.Username,
				TicketNumber: int(ticket.ID.Timestamp().Unix()),
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
			}
		}
	}

	// Send welcome message (include any answers from modal)
	SendWelcomeMessage(s, channel.ID, i.Member.User, panelData, QuestionsAndAnswers)

	// Update interaction response
	s.InteractionResponseEdit(i.Interaction, &discordgo.WebhookEdit{
		Content: strPtr(fmt.Sprintf("Ticket created! Please check <#%s>", channel.ID)),
	})
}