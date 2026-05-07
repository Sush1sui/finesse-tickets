package deploy

import (
	"errors"

	"github.com/Sush1sui/FNS_BOT/internal/bot/commands"
	"github.com/bwmarrin/discordgo"
)

var SlashCommands = []*discordgo.ApplicationCommand{
	{
		Name:        "hello-world",
		Description: "Replies with Hello, World!",
		Type:        discordgo.ChatApplicationCommand,
	},
}

var CommandHandlers = map[string]func(s *discordgo.Session, i *discordgo.InteractionCreate){
	"hello-world": commands.HelloWorld,
}

func DeployCommands(s *discordgo.Session, guildID string) error {
	if s == nil || s.State == nil || s.State.User == nil {
		return errors.New("session not ready")
	}
	if guildID == "" {
		return errors.New("guildID empty")
	}

	appID := s.State.User.ID
	// Single API call; overwrites to remove stale commands.
	_, err := s.ApplicationCommandBulkOverwrite(appID, guildID, SlashCommands)
	return err
}
