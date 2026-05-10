package api

import (
	"net/http"

	"github.com/Sush1sui/FNS_BOT/internal/api/auth"
	"github.com/Sush1sui/FNS_BOT/internal/api/server-config"
	"github.com/Sush1sui/FNS_BOT/internal/config"
	"github.com/Sush1sui/FNS_BOT/internal/db"
	"github.com/Sush1sui/FNS_BOT/internal/storage"
)

func NewRouter(queries *db.Queries, storageClient *storage.Client, cfg *config.Config) http.Handler {
	s := &Server{
		DB:      queries,
		Storage: storageClient,
		Config:  cfg,
	}

	configHandler := &serverconfig.Handler{DB: queries}
	authHandler := &auth.Handler{Server: s}

	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", s.handleHealth)

	// Server config routes with auth wrapper
	mux.HandleFunc("GET /api/config/{server_id}", s.wrapAuthConfig(configHandler.HandleGetServerConfig))
	mux.HandleFunc("PUT /api/config/{server_id}", s.wrapAuthConfig(configHandler.HandleUpdateServerConfig))

	// Auth routes
	mux.HandleFunc("GET /api/auth/login", authHandler.HandleAuthLogin)
	mux.HandleFunc("GET /api/auth/callback", authHandler.HandleAuthCallback)
	mux.HandleFunc("GET /api/auth/me", authHandler.HandleAuthMe)
	mux.HandleFunc("GET /api/auth/servers", authHandler.HandleAuthServers)
	mux.HandleFunc("POST /api/auth/logout", authHandler.HandleAuthLogout)

	return EnableCORS(mux, cfg.ClientOrigin, true)
}

// wrapAuthConfig wraps a handler to require auth + server authorization
func (s *Server) wrapAuthConfig(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		serverID := r.PathValue("server_id")

		claims, err := s.AuthFromRequest(r)
		if err != nil {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
			return
		}

		authorized, err := s.IsAuthorizedForServer(r.Context(), serverID, claims)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "auth check failed"})
			return
		}
		if !authorized {
			writeJSON(w, http.StatusForbidden, map[string]string{"error": "access denied"})
			return
		}

		next(w, r)
	}
}
