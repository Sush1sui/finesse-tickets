package api

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/Sush1sui/FNS_BOT/internal/bot"
	"github.com/Sush1sui/FNS_BOT/internal/utils"
	"github.com/golang-jwt/jwt/v5"
)

const (
	authCookieName  = "fns_auth"
	stateCookieName = "fns_oauth_state"
)

type AuthClaims struct {
	UserID      string `json:"uid"`
	Name        string `json:"name"`
	Email       string `json:"email,omitempty"`
	Image       string `json:"image,omitempty"`
	DiscordID   string `json:"discord_id"`
	AccessToken string `json:"access_token"`
	jwt.RegisteredClaims
}

func (c *AuthClaims) GetDiscordID() string   { return c.DiscordID }
func (c *AuthClaims) GetAccessToken() string { return c.AccessToken }

type (
	discordTokenResponse = utils.DiscordTokenResponse
	discordUser          = utils.DiscordUser
	discordGuild         = utils.DiscordGuild
	discordGuildMember   = utils.DiscordGuildMember
	serverSummary        = utils.ServerSummary
)

func (s *Server) handleAuthLogin(w http.ResponseWriter, r *http.Request) {
	// Start OAuth login and set CSRF state cookie.
	state, err := utils.RandomState(24)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to init auth"})
		return
	}

	utils.SetStateCookie(w, state, s.Config.CookieSecure, utils.CookieSameSite(s.Config.CookieSecure), stateCookieName, 300)

	authURL := fmt.Sprintf(
		"https://discord.com/oauth2/authorize?client_id=%s&redirect_uri=%s&response_type=code&scope=%s&state=%s",
		url.QueryEscape(s.Config.DiscordClientID),
		url.QueryEscape(s.Config.DiscordRedirectURL),
		url.QueryEscape("identify email guilds"),
		url.QueryEscape(state),
	)

	http.Redirect(w, r, authURL, http.StatusFound)
}

func (s *Server) handleAuthCallback(w http.ResponseWriter, r *http.Request) {
	// Exchange code for token, fetch user, mint JWT cookie.
	code := r.URL.Query().Get("code")
	state := r.URL.Query().Get("state")
	if code == "" || state == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "missing code or state"})
		return
	}

	if !utils.ValidateStateCookie(r, state, stateCookieName) {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid state"})
		return
	}

	token, err := utils.ExchangeDiscordToken(r.Context(), s.Config.DiscordClientID, s.Config.DiscordClientSecret, s.Config.DiscordRedirectURL, code)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "token exchange failed"})
		return
	}

	user, err := utils.FetchDiscordUser(r.Context(), token.AccessToken)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "failed to fetch user"})
		return
	}

	name := user.GlobalName
	if name == "" {
		name = user.Username
	}

	image := ""
	if user.Avatar != "" {
		image = fmt.Sprintf("https://cdn.discordapp.com/avatars/%s/%s.png", user.ID, user.Avatar)
	}

	jwtToken, err := s.signJWT(*user, name, image, token)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to sign token"})
		return
	}

	utils.SetAuthCookie(w, jwtToken, s.Config.CookieSecure, utils.CookieSameSite(s.Config.CookieSecure), authCookieName)
	utils.ClearStateCookie(w, s.Config.CookieSecure, utils.CookieSameSite(s.Config.CookieSecure), stateCookieName)

	http.Redirect(w, r, s.Config.ClientOrigin, http.StatusFound)
}

func (s *Server) handleAuthLogout(w http.ResponseWriter, r *http.Request) {
	utils.ClearAuthCookie(w, s.Config.CookieSecure, utils.CookieSameSite(s.Config.CookieSecure), authCookieName)
	writeJSON(w, http.StatusOK, map[string]string{"status": "logged out"})
}

func (s *Server) handleAuthMe(w http.ResponseWriter, r *http.Request) {
	claims, err := s.AuthFromRequest(r)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	serverID := r.URL.Query().Get("server_id")
	authorized := true
	if serverID != "" {
		// Optional server authorization check.
		authorized, err = s.IsAuthorizedForServer(r.Context(), serverID, claims)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "failed auth check"})
			return
		}
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"user": map[string]string{
			"id":        claims.UserID,
			"name":      claims.Name,
			"email":     claims.Email,
			"image":     claims.Image,
			"discordId": claims.DiscordID,
		},
		"authorized": authorized,
	})
}

func (s *Server) handleAuthServers(w http.ResponseWriter, r *http.Request) {
	claims, err := s.AuthFromRequest(r)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	if claims.AccessToken == "" {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "missing access token"})
		return
	}

	botGuilds, ok := botGuildMap()
	if !ok {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "bot not ready"})
		return
	}

	guilds, err := utils.FetchDiscordGuilds(r.Context(), claims.AccessToken)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "failed to fetch guilds"})
		return
	}

	servers := make([]serverSummary, 0, len(guilds))
	for _, g := range guilds {
		if _, ok := botGuilds[g.ID]; !ok {
			continue
		}

		allowed, err := s.isAuthorizedGuild(r.Context(), g, claims)
		if err != nil || !allowed {
			continue
		}

		servers = append(servers, serverSummary{
			ID:      g.ID,
			Name:    g.Name,
			IconURL: utils.GuildIconURL(g),
		})
	}

	writeJSON(w, http.StatusOK, map[string]any{"servers": servers})
}

// AuthFromRequest extracts JWT claims from request cookie
func (s *Server) AuthFromRequest(r *http.Request) (*AuthClaims, error) {
	cookie, err := r.Cookie(authCookieName)
	if err != nil || cookie.Value == "" {
		return nil, errors.New("missing auth cookie")
	}

	token, err := jwt.ParseWithClaims(cookie.Value, &AuthClaims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return []byte(s.Config.JwtSecret), nil
	})
	if err != nil || !token.Valid {
		return nil, errors.New("invalid token")
	}

	claims, ok := token.Claims.(*AuthClaims)
	if !ok {
		return nil, errors.New("invalid claims")
	}
	return claims, nil
}

func (s *Server) signJWT(user discordUser, name, image string, token *discordTokenResponse) (string, error) {
	expiresAt := time.Now().Add(7 * 24 * time.Hour)
	claims := AuthClaims{
		UserID:      user.ID,
		Name:        name,
		Email:       user.Email,
		Image:       image,
		DiscordID:   user.ID,
		AccessToken: token.AccessToken,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	signed, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(s.Config.JwtSecret))
	if err != nil {
		return "", err
	}
	return signed, nil
}

// IsAuthorizedForServer checks if user is authorized to access a server
func (s *Server) IsAuthorizedForServer(ctx context.Context, serverID string, claims *AuthClaims) (bool, error) {
	id, err := strconv.ParseInt(serverID, 10, 64)
	if err != nil {
		return false, err
	}

	cfg, err := s.DB.GetServerConfig(ctx, id)
	if err != nil {
		return false, err
	}

	if utils.ContainsString(cfg.AuthorizedMemberIds, claims.DiscordID) {
		return true, nil
	}

	if claims.AccessToken != "" {
		ok, err := s.HasGuildPerms(claims.AccessToken, serverID)
		if err == nil && ok {
			return true, nil
		}
	}

	if len(cfg.AuthorizedRoleIds) > 0 {
		ok, err := s.MemberHasRole(serverID, claims.DiscordID, cfg.AuthorizedRoleIds)
		if err == nil && ok {
			return true, nil
		}
	}

	return false, nil
}

func (s *Server) isAuthorizedGuild(ctx context.Context, guild discordGuild, claims *AuthClaims) (bool, error) {
	if utils.GuildIsAdmin(guild) {
		return true, nil
	}

	id, err := strconv.ParseInt(guild.ID, 10, 64)
	if err != nil {
		return false, err
	}

	cfg, err := s.DB.GetServerConfig(ctx, id)
	if err != nil {
		return false, nil
	}

	if utils.ContainsString(cfg.AuthorizedMemberIds, claims.DiscordID) {
		return true, nil
	}

	if len(cfg.AuthorizedRoleIds) == 0 {
		return false, nil
	}

	member, err := utils.FetchGuildMember(ctx, s.Config.BotToken, guild.ID, claims.DiscordID)
	if err != nil {
		return false, err
	}
	for _, roleID := range member.Roles {
		if utils.ContainsString(cfg.AuthorizedRoleIds, roleID) {
			return true, nil
		}
	}
	return false, nil
}

// HasGuildPerms checks if user has admin/manage guild permissions on a guild
func (s *Server) HasGuildPerms(accessToken, guildID string) (bool, error) {
	guilds, err := utils.FetchDiscordGuilds(context.Background(), accessToken)
	if err != nil {
		return false, err
	}

	for _, g := range guilds {
		if g.ID != guildID {
			continue
		}
		if g.Owner {
			return true, nil
		}
		perms, err := strconv.ParseInt(g.Permissions, 10, 64)
		if err != nil {
			return false, err
		}
		if perms&utils.PermAdministrator != 0 || perms&utils.PermManageGuild != 0 {
			return true, nil
		}
		return false, nil
	}

	return false, nil
}

// MemberHasRole checks if user has any of the allowed roles in a guild
func (s *Server) MemberHasRole(guildID, userID string, allowedRoles []string) (bool, error) {
	if s.Config.BotToken == "" {
		return false, errors.New("missing bot token")
	}

	member, err := utils.FetchGuildMember(context.Background(), s.Config.BotToken, guildID, userID)
	if err != nil {
		return false, err
	}

	for _, roleID := range member.Roles {
		if utils.ContainsString(allowedRoles, roleID) {
			return true, nil
		}
	}
	return false, nil
}

func botGuildMap() (map[string]struct{}, bool) {
	if bot.Session == nil || bot.Session.State == nil {
		return nil, false
	}

	state := bot.Session.State
	state.RLock()
	defer state.RUnlock()

	out := make(map[string]struct{}, len(state.Guilds))
	for _, g := range state.Guilds {
		out[g.ID] = struct{}{}
	}
	return out, true
}
