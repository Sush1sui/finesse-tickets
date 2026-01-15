package common

import "github.com/bwmarrin/discordgo"

func ResponseEdit(i *discordgo.InteractionCreate, s *discordgo.Session, m string) {
	s.InteractionResponseEdit(i.Interaction, &discordgo.WebhookEdit{
		Content: &m,
	})
}