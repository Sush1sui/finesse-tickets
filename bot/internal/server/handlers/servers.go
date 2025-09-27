package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/Sush1sui/fns-tickets/internal/bot"
)

type presenceReq struct {
    GuildIds []string `json:"guildIds"`
}

func GetAllServersHandler(w http.ResponseWriter, r *http.Request) {
    expected := os.Getenv("API_KEY")
    if expected != "" {
        if r.Header.Get("X-API-Key") != expected {
            fmt.Println("Unauthorized access attempt")
            http.Error(w, "unauthorized", http.StatusUnauthorized)
            return
        }
    }

    if r.Method != http.MethodPost {
        fmt.Println("Invalid method")
        http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
        return
    }

    // decode JSON body
    var req presenceReq
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        fmt.Println("Invalid request body:", err)
        http.Error(w, "invalid request", http.StatusBadRequest)
        return
    }
    if len(req.GuildIds) == 0 {
        fmt.Println("Empty guildIds")
        http.Error(w, "invalid request: guildIds required", http.StatusBadRequest)
        return
    }

    // get all servers the bot is in using bot's cache
    servers := bot.GetSession().State.Guilds
    var botServers []map[string]any
    for _, g := range servers {
        for _, id := range req.GuildIds {
            if g.ID == id {
                botServers = append(botServers, map[string]any{
                    "id":   g.ID,
                    "name": g.Name,
                    "icon": g.Icon,
                })
            }
        }
    }

    resp := map[string]interface{}{
        "servers": botServers,
    }
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    _ = json.NewEncoder(w).Encode(resp)
}