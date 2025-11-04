package routes

import (
	"net/http"

	"github.com/Sush1sui/fns-tickets/internal/server/handlers"
)

func NewRouter() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/", handlers.IndexHandler)
	mux.HandleFunc("/api/servers", handlers.GetAllServersHandler)
	mux.HandleFunc("/api/guilds/", handlers.GetGuildChannelsHandler)

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		mux.ServeHTTP(w, r)
	})
}