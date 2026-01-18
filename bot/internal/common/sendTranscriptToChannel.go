package common

import (
	"fmt"
	"time"

	"github.com/Sush1sui/fns-tickets/internal/repository"
	"github.com/bwmarrin/discordgo"
)

func SendTranscriptToChannel(s *discordgo.Session, channelID string, ticket *repository.Ticket, transcript *repository.Transcript, metadata repository.TranscriptMetadata) error {
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

	return nil
}