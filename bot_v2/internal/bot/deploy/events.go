package deploy

import (
	"errors"
	"sync"

	"github.com/Sush1sui/FNS_BOT/internal/bot/events"
	"github.com/bwmarrin/discordgo"
)

var EventHandlers = []any{
	events.OnHelloWorld,
}

var eventsOnce sync.Once

func DeployEvents(s *discordgo.Session, guildID string) error {
	if s == nil {
		return errors.New("session nil")
	}
	_ = guildID

	// Register handlers once even if called many times.
	eventsOnce.Do(func() {
		for _, handler := range EventHandlers {
			s.AddHandler(handler)
		}
	})

	return nil
}
