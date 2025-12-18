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
}

func DeployEvents(s *discordgo.Session) {
	for _, handler := range EventHandlers {
		s.AddHandler(handler)
	}

	log.Println("Event handlers deployed successfully.")
}