// internal/api/handlers.go
package api

import (
	"encoding/json"
	"net/http"

	"github.com/Sush1sui/FNS_BOT/internal/config"
	"github.com/Sush1sui/FNS_BOT/internal/db"
	"github.com/Sush1sui/FNS_BOT/internal/storage"
)

type Server struct {
	DB      *db.Queries
	Storage *storage.Client
	Config  *config.Config
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "API is flying 🚀"})
}

// Auth handler wrappers - delegate to internal handlers in auth.go
func (s *Server) HandleAuthLogin(w http.ResponseWriter, r *http.Request) {
	s.handleAuthLogin(w, r)
}

func (s *Server) HandleAuthCallback(w http.ResponseWriter, r *http.Request) {
	s.handleAuthCallback(w, r)
}

func (s *Server) HandleAuthLogout(w http.ResponseWriter, r *http.Request) {
	s.handleAuthLogout(w, r)
}

func (s *Server) HandleAuthMe(w http.ResponseWriter, r *http.Request) {
	s.handleAuthMe(w, r)
}

func (s *Server) HandleAuthServers(w http.ResponseWriter, r *http.Request) {
	s.handleAuthServers(w, r)
}
