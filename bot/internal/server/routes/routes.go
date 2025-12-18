package routes

import (
	"net/http"
	"strings"

	"github.com/NYTimes/gziphandler"
	"github.com/Sush1sui/fns-tickets/internal/server/handlers"
)

func NewRouter() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/", handlers.IndexHandler)
	mux.HandleFunc("/send-panel", handlers.SendPanelHandler)
	mux.HandleFunc("/api/servers", handlers.GetAllServersHandler)
	mux.HandleFunc("/api/guilds/", func(w http.ResponseWriter, r *http.Request) {
		// Route based on the path suffix
		if strings.HasSuffix(r.URL.Path, "/data") {
			handlers.GetGuildDataHandler(w, r)
		} else if strings.HasSuffix(r.URL.Path, "/channels") {
			handlers.GetGuildChannelsHandler(w, r)
		} else if strings.HasSuffix(r.URL.Path, "/emojis") {
			handlers.GetGuildEmojisHandler(w, r)
		} else if strings.HasSuffix(r.URL.Path, "/roles") {
			handlers.GetGuildRolesHandler(w, r)
		} else if strings.HasSuffix(r.URL.Path, "/categories") {
			handlers.GetGuildCategoriesHandler(w, r)
		} else {
			http.NotFound(w, r)
		}
	})

	// Wrap with gzip compression
	return gziphandler.GzipHandler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		mux.ServeHTTP(w, r)
	}))
}