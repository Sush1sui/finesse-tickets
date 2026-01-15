package deploy

import (
	"log"

	"github.com/Sush1sui/fns-tickets/internal/bot/events"
	"github.com/bwmarrin/discordgo"
)

var EventHandlers = []any{
	events.HandleButtonInteraction,
	events.HandleMessageCreate,
	events.HandleGuildMemberRemove,
	handleGuildCreate, // Keep this in deploy package to avoid import cycle
}

// handleGuildCreate is called when the bot joins a new guild
func handleGuildCreate(s *discordgo.Session, g *discordgo.GuildCreate) {
	// Deploy commands to the newly joined guild
	_, err := s.ApplicationCommandBulkOverwrite(s.State.User.ID, g.ID, SlashCommands)
	if err != nil {
		log.Printf("Error deploying commands to new guild %s: %v", g.ID, err)
		return
	}
}

func DeployEvents(s *discordgo.Session) {
	for _, handler := range EventHandlers {
		s.AddHandler(handler)
	}
}