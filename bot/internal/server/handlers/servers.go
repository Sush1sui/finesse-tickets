package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/Sush1sui/fns-tickets/internal/bot"
)

type presenceReq struct {
    GuildIds []string `json:"guildIds"`
}
type serverInfo struct {
    ID   string `json:"id"`
    Name string `json:"name"`
    Icon string `json:"icon,omitempty"`
}
type presenceRes struct {
    Servers []serverInfo `json:"servers"`
}

func GetAllServersHandler(w http.ResponseWriter, r *http.Request) {
    // API key check
    expected := os.Getenv("BOT_API_KEY")
    if expected == "" {
        log.Println("WARNING: BOT_API_KEY not set in environment")
    }
    if expected != "" {
        if r.Header.Get("X-API-Key") != expected {
            log.Printf("Unauthorized access attempt. Expected key present: %v, Received: %v", expected != "", r.Header.Get("X-API-Key") != "")
            http.Error(w, "unauthorized", http.StatusUnauthorized)
            return
        }
    }

    if r.Method != http.MethodPost {
        http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
        return
    }

    // decode JSON body
    var req presenceReq
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        log.Println("Invalid request body:", err)
        http.Error(w, "invalid request", http.StatusBadRequest)
        return
    }
    _ = r.Body.Close()

    if len(req.GuildIds) == 0 {
        http.Error(w, "invalid request: guildIds required", http.StatusBadRequest)
        return
    }

    // ensure bot session/state exists
    s := bot.GetSession()
    if s == nil {
        log.Println("Bot session is nil - bot not ready")
        http.Error(w, "bot not ready", http.StatusServiceUnavailable)
        return
    }
    if s.State == nil {
        log.Println("Bot session state is nil - bot not ready")
        http.Error(w, "bot not ready", http.StatusServiceUnavailable)
        return
    }

    // build a lookup of requested guild ids for quick membership test
    reqSet := map[string]struct{}{}
    for _, id := range req.GuildIds {
        reqSet[id] = struct{}{}
    }

    // iterate bot's cached guilds (discordgo.Guild)
    out := make([]serverInfo, 0, len(req.GuildIds))
    for _, g := range s.State.Guilds {
        if g == nil {
            continue
        }
        if _, ok := reqSet[g.ID]; !ok {
            continue
        }
        icon := ""
        if g.Icon != "" {
            icon = g.Icon
        }
        out = append(out, serverInfo{
            ID:   g.ID,
            Name: g.Name,
            Icon: icon,
        })
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    _ = json.NewEncoder(w).Encode(presenceRes{Servers: out})
}