package deploy

import (
	"log"

	"github.com/bwmarrin/discordgo"
)

var EventHandlers = []any{
}

func DeployEvents(s *discordgo.Session) {
	for _, handler := range EventHandlers {
		s.AddHandler(handler)
	}

	log.Println("Event handlers deployed successfully.")
}