package bot

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/Sush1sui/fns-tickets/internal/bot/deploy"
	"github.com/Sush1sui/fns-tickets/internal/config"
	"github.com/bwmarrin/discordgo"
)

var Session *discordgo.Session

func StartBot() {
	s, e := discordgo.New("Bot "+config.GlobalConfig.BotToken)
	if e != nil {
		log.Fatal("error creating Discord session, " + e.Error())
	}

	s.Identify.Intents = discordgo.IntentsAllWithoutPrivileged | discordgo.IntentsGuildPresences | discordgo.IntentsGuildMembers | discordgo.IntentsGuildMessages

	s.AddHandler(func(sess *discordgo.Session, r *discordgo.Ready) {
    sess.UpdateStatusComplex(discordgo.UpdateStatusData{
        Status: "idle",
        Activities: []*discordgo.Activity{
            {
                Name: "Finesse!",
                Type: discordgo.ActivityTypeListening,
            },
        },
    })
	})

	e = s.Open()
	if e != nil {
		log.Fatal("error opening connection to Discord, " + e.Error())
	}
	defer s.Close()

	deploy.DeployCommands(s)
	deploy.DeployEvents(s)

	fmt.Println("Bot is now running")

	sc := make(chan os.Signal, 1)
	signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM, os.Interrupt)
	<-sc
	fmt.Println("Shutting down bot gracefully...")
}