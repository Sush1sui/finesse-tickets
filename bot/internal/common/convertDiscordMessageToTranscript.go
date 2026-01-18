package common

import (
	"time"

	"github.com/Sush1sui/fns-tickets/internal/repository"
	"github.com/bwmarrin/discordgo"
)

func ConvertDiscordMessageToTranscript(m *discordgo.Message) repository.TranscriptMessage {
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