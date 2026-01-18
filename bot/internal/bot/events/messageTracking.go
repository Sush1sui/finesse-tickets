package events

import (
	"log"

	"github.com/Sush1sui/fns-tickets/internal/common"
	"github.com/Sush1sui/fns-tickets/internal/repository"
	"github.com/bwmarrin/discordgo"
)

// HandleMessageCreate tracks messages in ticket channels
func HandleMessageCreate(s *discordgo.Session, m *discordgo.MessageCreate) {
	// Ignore bot messages for auto-close tracking, but include them in transcripts
	ignoreForAutoClose := m.Author.Bot

	// Check if message is in a ticket channel
	ticket, err := repository.GetTicketByChannel(m.ChannelID)
	if err != nil {
		log.Printf("Error checking ticket: %v", err)
		return
	}

	if ticket != nil && !ticket.Closed {
		// Update last message timestamp (only for non-bot messages)
		if !ignoreForAutoClose {
			if err := repository.UpdateTicketLastMessage(m.ChannelID); err != nil {
				log.Printf("Error updating ticket timestamp: %v", err)
			}
		}

		// Add message to transcript if transcript exists
		transcript, err := repository.GetTranscript(ticket.ID.Hex())
		if err != nil {
			log.Printf("Error checking transcript: %v", err)
		} else if transcript != nil {
			// Convert Discord message to transcript message
			transcriptMsg := common.ConvertDiscordMessageToTranscript(m.Message)

			// Add message to transcript
			if err := repository.AddMessageToTranscript(ticket.ID.Hex(), transcriptMsg); err != nil {
				log.Printf("Error adding message to transcript: %v", err)
			}
		}
	}
}

// HandleGuildMemberRemove handles when a user leaves the server
func HandleGuildMemberRemove(s *discordgo.Session, m *discordgo.GuildMemberRemove) {
	// Get guild configuration
	guildConfig, err := repository.GetGuildConfig(m.GuildID)
	if err != nil {
		log.Printf("Error fetching guild config: %v", err)
		return
	}

	// Check if auto-close on user leave is enabled
	if !guildConfig.TicketConfig.AutoClose.Enabled || !guildConfig.TicketConfig.AutoClose.CloseWhenUserLeaves {
		return
	}

	// Get active tickets for this specific user in this guild
	tickets, err := repository.GetUserActiveTickets(m.GuildID, m.User.ID)
	if err != nil {
		log.Printf("Error fetching user tickets: %v", err)
		return
	}

	// Close all tickets for the user who left
	for _, ticket := range tickets {
		// Close the ticket in database
		if err := repository.CloseTicket(ticket.ChannelID); err != nil {
			log.Printf("Error closing ticket in database: %v", err)
			continue
		}

		// Delete the channel
		_, err := s.ChannelDelete(ticket.ChannelID)
		if err != nil {
			log.Printf("Error deleting ticket channel: %v", err)
		}
	}
}

