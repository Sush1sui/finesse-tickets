package events

import (
	"log"
	"time"

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
			transcriptMsg := convertDiscordMessageToTranscript(m.Message)

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

// convertDiscordMessageToTranscript converts a Discord message to a transcript message
func convertDiscordMessageToTranscript(m *discordgo.Message) repository.TranscriptMessage {
	msg := repository.TranscriptMessage{
		ID:        m.ID,
		Type:      "message",
		Timestamp: time.Now(),
		Edited:    false,
		Author: repository.TranscriptAuthor{
			ID:            m.Author.ID,
			Username:      m.Author.Username,
			Discriminator: m.Author.Discriminator,
			Avatar:        &m.Author.Avatar,
			Bot:           m.Author.Bot,
		},
	}

	// Content
	if m.Content != "" {
		msg.Content = &m.Content
	}

	// Embeds
	if len(m.Embeds) > 0 {
		msg.Embeds = make([]repository.TranscriptEmbed, len(m.Embeds))
		for i, embed := range m.Embeds {
			transcriptEmbed := repository.TranscriptEmbed{
				Fields: make([]repository.TranscriptEmbedField, len(embed.Fields)),
			}

			if embed.Title != "" {
				transcriptEmbed.Title = &embed.Title
			}
			if embed.Description != "" {
				transcriptEmbed.Description = &embed.Description
			}
			if embed.URL != "" {
				transcriptEmbed.URL = &embed.URL
			}
			if embed.Color != 0 {
				transcriptEmbed.Color = &embed.Color
			}

			// Fields
			for j, field := range embed.Fields {
				transcriptEmbed.Fields[j] = repository.TranscriptEmbedField{
					Name:   field.Name,
					Value:  field.Value,
					Inline: field.Inline,
				}
			}

			// Image
			if embed.Image != nil {
				transcriptEmbed.Image = &repository.TranscriptImage{
					URL: embed.Image.URL,
				}
			}

			// Thumbnail
			if embed.Thumbnail != nil {
				transcriptEmbed.Thumbnail = &repository.TranscriptImage{
					URL: embed.Thumbnail.URL,
				}
			}

			// Footer
			if embed.Footer != nil {
				transcriptEmbed.Footer = &repository.TranscriptFooter{
					Text: embed.Footer.Text,
				}
				if embed.Footer.IconURL != "" {
					transcriptEmbed.Footer.IconURL = &embed.Footer.IconURL
				}
			}

			// Author
			if embed.Author != nil {
				transcriptEmbed.Author = &repository.TranscriptEmbedAuthor{
					Name: embed.Author.Name,
				}
				if embed.Author.URL != "" {
					transcriptEmbed.Author.URL = &embed.Author.URL
				}
				if embed.Author.IconURL != "" {
					transcriptEmbed.Author.IconURL = &embed.Author.IconURL
				}
			}

			msg.Embeds[i] = transcriptEmbed
		}
	}

	// Attachments
	if len(m.Attachments) > 0 {
		msg.Attachments = make([]repository.TranscriptAttachment, len(m.Attachments))
		for i, att := range m.Attachments {
			msg.Attachments[i] = repository.TranscriptAttachment{
				ID:       att.ID,
				Filename: att.Filename,
				URL:      att.URL,
				ProxyURL: att.ProxyURL,
				Size:     att.Size,
			}
			if att.ContentType != "" {
				msg.Attachments[i].ContentType = &att.ContentType
			}
			if att.Width != 0 {
				msg.Attachments[i].Width = &att.Width
			}
			if att.Height != 0 {
				msg.Attachments[i].Height = &att.Height
			}
		}
	}

	// Reactions
	if len(m.Reactions) > 0 {
		msg.Reactions = make([]repository.TranscriptReaction, len(m.Reactions))
		for i, reaction := range m.Reactions {
			emoji := reaction.Emoji.Name
			if reaction.Emoji.ID != "" {
				emoji = "<:" + reaction.Emoji.Name + ":" + reaction.Emoji.ID + ">"
			}
			msg.Reactions[i] = repository.TranscriptReaction{
				Emoji: emoji,
				Count: reaction.Count,
			}
		}
	}

	// Edited
	if m.EditedTimestamp != nil {
		msg.Edited = true
		editTime := *m.EditedTimestamp
		msg.EditedTimestamp = &editTime
	}

	return msg
}
