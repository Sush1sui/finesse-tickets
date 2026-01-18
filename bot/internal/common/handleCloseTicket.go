package common

import (
	"log"
	"time"

	"github.com/Sush1sui/fns-tickets/internal/repository"
	"github.com/bwmarrin/discordgo"
)

func HandleCloseTicket(s *discordgo.Session, i *discordgo.InteractionCreate) {
	// Check if user is authorized to close the ticket (staff/admin only)
	if i.Member != nil && i.GuildID != "" {
		if IsStaffMember(s, i.GuildID, i.Member) {
			// Not authorized - only staff can close tickets
			err := s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: "❌ You don't have permission to close this ticket. Only staff members can close tickets.",
					Flags:   discordgo.MessageFlagsEphemeral,
				},
			})
			if err != nil {
				log.Printf("Error responding to unauthorized close attempt: %v", err)
			}
			return
		}
	}

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
		transcript, err := repository.GetTranscript(ticket.ID.Hex())
		if err != nil {
			log.Printf("Error checking transcript: %v", err)
		}

		if transcript != nil {
			// Fetch all messages from the channel to ensure complete transcript
			messages, err := s.ChannelMessages(i.ChannelID, 100, "", "", "")
			if err != nil {
				log.Printf("Error fetching channel messages: %v", err)
			} else {
				// Add any missing messages to transcript (in reverse order)
				for j := len(messages) - 1; j >= 0; j-- {
					transcriptMsg := ConvertDiscordMessageToTranscript(messages[j])
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

			if err := repository.UpdateTranscriptMetadata(ticket.ID.Hex(), metadata); err != nil {
				log.Printf("Error updating transcript metadata: %v", err)
			} else {
				// Send transcript to configured channel if enabled
				if guildConfig != nil && guildConfig.TicketConfig.TicketTranscript != nil && *guildConfig.TicketConfig.TicketTranscript != "" {
					if err := SendTranscriptToChannel(s, *guildConfig.TicketConfig.TicketTranscript, ticket, transcript, metadata); err != nil {
						log.Printf("Error sending transcript to channel: %v", err)
					}
				}
			}
		}
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