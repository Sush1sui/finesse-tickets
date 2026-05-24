package api

import (
	"net/http"

	"github.com/Sush1sui/FNS_BOT/internal/api/auth"
	"github.com/Sush1sui/FNS_BOT/internal/api/panels"
	serverconfig "github.com/Sush1sui/FNS_BOT/internal/api/server-config"
	"github.com/Sush1sui/FNS_BOT/internal/api/transcripts"
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
	panelsHandler := &panels.Handler{DB: queries}
	transcriptsHandler := &transcripts.Handler{DB: queries, Storage: s.Storage}

	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", s.handleHealth)

	// Server config routes with auth wrapper
	mux.HandleFunc("GET /api/config/{server_id}", s.wrapAuthConfig(configHandler.HandleGetServerConfig))
	mux.HandleFunc("PUT /api/config/{server_id}", s.wrapAuthConfig(configHandler.HandleUpdateServerConfig))
	mux.HandleFunc("GET /api/servers/{server_id}/meta", s.wrapAuthConfig(configHandler.HandleGetMeta))
	mux.HandleFunc("GET /api/servers/{server_id}/meta/roles", s.wrapAuthConfig(configHandler.HandleGetRoles))
	mux.HandleFunc("GET /api/servers/{server_id}/meta/channels", s.wrapAuthConfig(configHandler.HandleGetChannels))
	mux.HandleFunc("GET /api/servers/{server_id}/meta/categories", s.wrapAuthConfig(configHandler.HandleGetCategories))
	mux.HandleFunc("GET /api/servers/{server_id}/meta/emojis", s.wrapAuthConfig(configHandler.HandleGetEmojis))

	// Staff routes
	mux.HandleFunc("GET /api/servers/{server_id}/staff", s.wrapAuthConfig(configHandler.HandleGetStaff))
	mux.HandleFunc("PUT /api/servers/{server_id}/staff", s.wrapAuthConfig(configHandler.HandleUpdateStaff))

	// Auth routes
	mux.HandleFunc("GET /api/auth/login", authHandler.HandleAuthLogin)
	mux.HandleFunc("GET /api/auth/callback", authHandler.HandleAuthCallback)
	mux.HandleFunc("GET /api/auth/me", authHandler.HandleAuthMe)
	mux.HandleFunc("GET /api/auth/servers", authHandler.HandleAuthServers)
	mux.HandleFunc("POST /api/auth/logout", authHandler.HandleAuthLogout)

	// Panel routes
	mux.HandleFunc("GET /api/servers/{server_id}/panels", s.wrapAuthConfig(panelsHandler.HandleListPanels))
	mux.HandleFunc("GET /api/servers/{server_id}/panels/{panel_id}", s.wrapAuthConfig(panelsHandler.HandleGetPanel))
	mux.HandleFunc("POST /api/servers/{server_id}/panels", s.wrapAuthConfig(panelsHandler.HandleCreatePanel))
	mux.HandleFunc("PUT /api/servers/{server_id}/panels/{panel_id}", s.wrapAuthConfig(panelsHandler.HandleUpdatePanel))
	mux.HandleFunc("DELETE /api/servers/{server_id}/panels/{panel_id}", s.wrapAuthConfig(panelsHandler.HandleDeletePanel))
	mux.HandleFunc("POST /api/servers/{server_id}/panels/{panel_id}/send", s.wrapAuthConfig(panelsHandler.HandleSendPanel))

	// Multi-panel routes
	mux.HandleFunc("GET /api/servers/{server_id}/multi-panels", s.wrapAuthConfig(panelsHandler.HandleListMultiPanels))
	mux.HandleFunc("GET /api/servers/{server_id}/multi-panels/{multi_panel_id}", s.wrapAuthConfig(panelsHandler.HandleGetMultiPanel))
	mux.HandleFunc("POST /api/servers/{server_id}/multi-panels", s.wrapAuthConfig(panelsHandler.HandleCreateMultiPanel))
	mux.HandleFunc("PUT /api/servers/{server_id}/multi-panels/{multi_panel_id}", s.wrapAuthConfig(panelsHandler.HandleUpdateMultiPanel))
	mux.HandleFunc("DELETE /api/servers/{server_id}/multi-panels/{multi_panel_id}", s.wrapAuthConfig(panelsHandler.HandleDeleteMultiPanel))
	mux.HandleFunc("POST /api/servers/{server_id}/multi-panels/{multi_panel_id}/send", s.wrapAuthConfig(panelsHandler.HandleSendMultiPanel))

	// Transcript routes
	mux.HandleFunc("GET /api/servers/{server_id}/transcripts", s.wrapAuthConfig(transcriptsHandler.HandleListTranscripts))
	mux.HandleFunc("GET /api/servers/{server_id}/transcripts/{transcript_id}", s.wrapAuthConfig(transcriptsHandler.HandleGetTranscript))

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
