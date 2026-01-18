package common

import (
	"fmt"
	"log"
	"strings"

	"github.com/bwmarrin/discordgo"
)

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

type PanelData struct {
	PanelID         string                 `json:"panelId"`
	ServerID        string                 `json:"serverId"`
	MentionOnOpen   []string               `json:"mentionOnOpen"`
	TicketCategory  *string                `json:"ticketCategory"`
	WelcomeEmbed    *WelcomeEmbedData      `json:"welcomeEmbed"`
}


func SendWelcomeMessage(s *discordgo.Session, channelID string, user *discordgo.User, panelData PanelData) {
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
	mentions := []string{user.Mention()} // Always mention the user who opened the ticket
	if len(panelData.MentionOnOpen) > 0 {
		for _, roleID := range panelData.MentionOnOpen {
			mentions = append(mentions, fmt.Sprintf("<@&%s>", roleID))
		}
	}
	mentionStr := strings.Join(mentions, " ")

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
		Content: mentionStr,
		Embeds:  []*discordgo.MessageEmbed{embed},
		Components: []discordgo.MessageComponent{
			discordgo.ActionsRow{
				Components: []discordgo.MessageComponent{closeButton},
			},
		},
	}

	// Send message
	_, err := s.ChannelMessageSendComplex(channelID, messageSend)

	if err != nil {
		log.Printf("Error sending welcome message: %v", err)
	}
}