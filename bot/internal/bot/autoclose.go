package bot

import (
	"log"
	"time"

	"github.com/Sush1sui/fns-tickets/internal/repository"
	"github.com/bwmarrin/discordgo"
)

// StartAutoCloseWorker starts a background worker that checks for inactive tickets
func StartAutoCloseWorker(s *discordgo.Session) {
	ticker := time.NewTicker(5 * time.Minute) // Check every 5 minutes
	defer ticker.Stop()

	log.Println("Auto-close worker started")

	for range ticker.C {
		checkAndCloseInactiveTickets(s)
	}
}

func checkAndCloseInactiveTickets(s *discordgo.Session) {
	tickets, err := repository.GetInactiveTickets()
	if err != nil {
		log.Printf("Error fetching tickets: %v", err)
		return
	}

	now := time.Now()

	for _, ticket := range tickets {
		// Get guild configuration
		guildConfig, err := repository.GetGuildConfig(ticket.GuildID)
		if err != nil {
			log.Printf("Error fetching guild config for %s: %v", ticket.GuildID, err)
			continue
		}

		// Skip if auto-close is not enabled
		if !guildConfig.TicketConfig.AutoClose.Enabled {
			continue
		}

		shouldClose := false
		reason := ""

		// Check since open without response
		openConfig := guildConfig.TicketConfig.AutoClose.SinceOpenWithoutResponse
		if openConfig.Days > 0 || openConfig.Hours > 0 || openConfig.Minutes > 0 {
			sinceOpenDuration := time.Duration(openConfig.Days)*24*time.Hour +
				time.Duration(openConfig.Hours)*time.Hour +
				time.Duration(openConfig.Minutes)*time.Minute

			if now.Sub(ticket.CreatedAt) >= sinceOpenDuration && ticket.CreatedAt == ticket.LastMessageAt {
				shouldClose = true
				reason = "no response since opening"
			}
		}

		// Check since last message
		lastConfig := guildConfig.TicketConfig.AutoClose.SinceLastResponse
		if !shouldClose && (lastConfig.Days > 0 || lastConfig.Hours > 0 || lastConfig.Minutes > 0) {
			sinceLastDuration := time.Duration(lastConfig.Days)*24*time.Hour +
				time.Duration(lastConfig.Hours)*time.Hour +
				time.Duration(lastConfig.Minutes)*time.Minute

			if now.Sub(ticket.LastMessageAt) >= sinceLastDuration {
				shouldClose = true
				reason = "inactivity"
			}
		}

		if shouldClose {
			// Send closing message
			_, err := s.ChannelMessageSend(ticket.ChannelID, "🔒 This ticket is being automatically closed due to "+reason+".")
			if err != nil {
				log.Printf("Error sending close message: %v", err)
			}

			// Wait a moment for the message to send
			time.Sleep(2 * time.Second)

			// Mark ticket as closed in database
			if err := repository.CloseTicket(ticket.ChannelID); err != nil {
				log.Printf("Error closing ticket in database: %v", err)
				continue
			}

			// Delete the channel
			_, err = s.ChannelDelete(ticket.ChannelID)
			if err != nil {
				log.Printf("Error deleting ticket channel %s: %v", ticket.ChannelID, err)
			} else {
				log.Printf("Auto-closed ticket %s due to %s", ticket.ChannelID, reason)
			}
		}
	}
}
