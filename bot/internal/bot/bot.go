package bot

import (
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"

	"github.com/Sush1sui/fns-tickets/internal/bot/deploy"
	"github.com/Sush1sui/fns-tickets/internal/config"
	"github.com/Sush1sui/fns-tickets/internal/repository"
	"github.com/bwmarrin/discordgo"
)

var (
    session   *discordgo.Session
    sessionMu sync.RWMutex

    // closed once the bot is ready
    ReadyChan = make(chan struct{})
)

// GetSession returns the current session (may be nil until ready)
func GetSession() *discordgo.Session {
    sessionMu.RLock()
    s := session
    sessionMu.RUnlock()
    return s
}

// setSession replaces the global session
func setSession(s *discordgo.Session) {
    sessionMu.Lock()
    session = s
    sessionMu.Unlock()
}

func StartBot() {
    // Initialize database connection
    if err := repository.InitDB(); err != nil {
        log.Fatal("Failed to initialize database: " + err.Error())
    }
    defer repository.CloseDB()

    s, err := discordgo.New("Bot " + config.GlobalConfig.BotToken)
    if err != nil {
        log.Fatal("error creating Discord session, " + err.Error())
    }

    // assign to guarded global
    setSession(s)

    s.Identify.Intents = discordgo.IntentsAllWithoutPrivileged | discordgo.IntentsGuildPresences | discordgo.IntentsGuildMembers | discordgo.IntentsGuildMessages

    s.AddHandler(func(sess *discordgo.Session, r *discordgo.Ready) {
        // signal readiness once
        select {
        case <-ReadyChan:
            // already closed
        default:
            close(ReadyChan)
        }

        _ = sess.UpdateStatusComplex(discordgo.UpdateStatusData{
            Status: "idle",
            Activities: []*discordgo.Activity{
                {
                    Name: "Do it with Finesse!",
                },
            },
        })
    })

    if err = s.Open(); err != nil {
        log.Fatal("error opening connection to Discord, " + err.Error())
    }
    defer s.Close()

    deploy.DeployCommands(s)
    deploy.DeployEvents(s)

    // Start auto-close background worker
    stopAutoClose := StartAutoCloseWorker(s)

    sc := make(chan os.Signal, 1)
    signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM, os.Interrupt)
    <-sc
    
    // Stop auto-close worker
    stopAutoClose()
}