package events

import (
	"log"

	"github.com/Sush1sui/fns-tickets/internal/repository"
	"github.com/bwmarrin/discordgo"
)

// HandleMessageCreate tracks messages in ticket channels
func HandleMessageCreate(s *discordgo.Session, m *discordgo.MessageCreate) {
	// Ignore bot messages
	if m.Author.Bot {
		return
	}

	// Check if message is in a ticket channel
	ticket, err := repository.GetTicketByChannel(m.ChannelID)
	if err != nil {
		log.Printf("Error checking ticket: %v", err)
		return
	}

	if ticket != nil && !ticket.Closed {
		// Update last message timestamp
		if err := repository.UpdateTicketLastMessage(m.ChannelID); err != nil {
			log.Printf("Error updating ticket timestamp: %v", err)
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

	// Get all active tickets for this user
	tickets, err := repository.GetInactiveTickets()
	if err != nil {
		log.Printf("Error fetching tickets: %v", err)
		return
	}

	for _, ticket := range tickets {
		if ticket.GuildID == m.GuildID && ticket.UserID == m.User.ID && !ticket.Closed {
			// Close the ticket
			if err := repository.CloseTicket(ticket.ChannelID); err != nil {
				log.Printf("Error closing ticket in database: %v", err)
				continue
			}

			// Delete the channel
			_, err := s.ChannelDelete(ticket.ChannelID)
			if err != nil {
				log.Printf("Error deleting ticket channel: %v", err)
			} else {
				log.Printf("Auto-closed ticket %s due to user leaving", ticket.ChannelID)
			}
		}
	}
}
