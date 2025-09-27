package routes

import (
	"net/http"

	"github.com/Sush1sui/fns-tickets/internal/server/handlers"
)

func NewRouter() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/", handlers.IndexHandler)
	mux.HandleFunc("/api/servers", handlers.GetAllServersHandler)

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
			case "/":
				mux.ServeHTTP(w, r)
			case "/api/servers":
				mux.ServeHTTP(w, r)
			default:
				http.NotFound(w, r)
		}
	})
}