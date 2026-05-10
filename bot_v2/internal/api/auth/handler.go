package auth

import (
	"net/http"
)

// ServerInterface defines the methods needed by auth handlers
type ServerInterface interface {
	HandleAuthLogin(w http.ResponseWriter, r *http.Request)
	HandleAuthCallback(w http.ResponseWriter, r *http.Request)
	HandleAuthLogout(w http.ResponseWriter, r *http.Request)
	HandleAuthMe(w http.ResponseWriter, r *http.Request)
	HandleAuthServers(w http.ResponseWriter, r *http.Request)
}

// Handler handles HTTP endpoints for authentication
type Handler struct {
	Server ServerInterface
}

// HandleAuthLogin starts OAuth login flow
func (h *Handler) HandleAuthLogin(w http.ResponseWriter, r *http.Request) {
	h.Server.HandleAuthLogin(w, r)
}

// HandleAuthCallback handles OAuth callback from Discord
func (h *Handler) HandleAuthCallback(w http.ResponseWriter, r *http.Request) {
	h.Server.HandleAuthCallback(w, r)
}

// HandleAuthLogout clears auth cookies
func (h *Handler) HandleAuthLogout(w http.ResponseWriter, r *http.Request) {
	h.Server.HandleAuthLogout(w, r)
}

// HandleAuthMe returns current user info
func (h *Handler) HandleAuthMe(w http.ResponseWriter, r *http.Request) {
	h.Server.HandleAuthMe(w, r)
}

// HandleAuthServers returns list of servers user has access to
func (h *Handler) HandleAuthServers(w http.ResponseWriter, r *http.Request) {
	h.Server.HandleAuthServers(w, r)
}