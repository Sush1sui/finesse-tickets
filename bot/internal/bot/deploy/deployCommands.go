package deploy

import (
	"fmt"
	"log"

	"github.com/bwmarrin/discordgo"
)

var SlashCommands = []*discordgo.ApplicationCommand{

}

var CommandHandlers = map[string]func(s *discordgo.Session, i *discordgo.InteractionCreate) {

}

func DeployCommands(s *discordgo.Session) {
	globalCmds, err := s.ApplicationCommands(s.State.User.ID, "")
	if err != nil {
		for _, cmd := range globalCmds {
			err := s.ApplicationCommandDelete(s.State.User.ID, "", cmd.ID)
			if err != nil {
				log.Printf("Failed to delete command %s: %v", cmd.Name, err)
			} else {
				log.Printf("Deleted command %s", cmd.Name)
			}
		}
	}

	guilds := s.State.Guilds
	for _, guild := range guilds {
		_, err := s.ApplicationCommandBulkOverwrite(s.State.User.ID, guild.ID, SlashCommands)
		if err != nil {
			log.Fatalf("Failed to deploy commands to guild %s: %v", guild.ID, err)
		}
	}

	s.AddHandler(func(s *discordgo.Session, i *discordgo.InteractionCreate) {
		if i.Type != discordgo.InteractionApplicationCommand {
        return // Only handle slash commands here!
    }
		if handler, ok := CommandHandlers[i.ApplicationCommandData().Name]; ok {
			handler(s, i)
		} else {
			fmt.Printf("Unknown command: %s\n", i.ApplicationCommandData().Name)
			fmt.Printf("Available commands: %v\n", CommandHandlers)
			s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: fmt.Sprintf("Unknown command: %s\n", i.ApplicationCommandData().Name),
					Flags: discordgo.MessageFlagsEphemeral,
				},
			})
		}
	})

	log.Println("Commands deployed successfully.")
}