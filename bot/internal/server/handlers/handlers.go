package handlers

import (
	"net/http"

	"github.com/Sush1sui/fns-tickets/internal/repository"
)

func IndexHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// query db
	repository.GetInactiveTickets()


	// Handle the index route
	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Do it with Finesse!"))
}