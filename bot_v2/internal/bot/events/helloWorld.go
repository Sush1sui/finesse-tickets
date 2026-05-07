package events

import "github.com/bwmarrin/discordgo"

func OnHelloWorld(s *discordgo.Session, m *discordgo.MessageCreate) {
	if m == nil || m.Author == nil || m.Author.Bot || m.GuildID == "" {
		return
	}

	if m.Content == "!hello" {
		s.ChannelMessageSend(m.ChannelID, "Hello, World!")
	}
}
