package commands

import (
	"github.com/bwmarrin/discordgo"
)

func HelloWorld(s *discordgo.Session, i *discordgo.InteractionCreate) {
	if i.Member == nil || i.GuildID == "" {
		return
	}

	s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseDeferredChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: "Thinking...",
			Flags:   discordgo.MessageFlagsEphemeral,
		},
	})

	s.ChannelMessageSend(i.ChannelID, "Hello World!")

	m := "Done!"
	s.InteractionResponseEdit(i.Interaction, &discordgo.WebhookEdit{
		Content: &m,
	})
}
