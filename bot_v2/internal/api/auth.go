package api

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/Sush1sui/FNS_BOT/internal/bot"
	"github.com/Sush1sui/FNS_BOT/internal/config"
	"github.com/golang-jwt/jwt/v5"
)

const (
	authCookieName  = "fns_auth"
	stateCookieName = "fns_oauth_state"

	discordAPIBase = "https://discord.com/api/v10"

	permAdministrator = 1 << 3
	permManageGuild   = 1 << 5
)

type authClaims struct {
	UserID      string `json:"uid"`
	Name        string `json:"name"`
	Email       string `json:"email,omitempty"`
	Image       string `json:"image,omitempty"`
	DiscordID   string `json:"discord_id"`
	AccessToken string `json:"access_token"`
	jwt.RegisteredClaims
}

type discordTokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int64  `json:"expires_in"`
	Scope       string `json:"scope"`
}

type discordUser struct {
	ID         string `json:"id"`
	Username   string `json:"username"`
	GlobalName string `json:"global_name"`
	Email      string `json:"email"`
	Avatar     string `json:"avatar"`
}

type discordGuild struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Icon        string `json:"icon"`
	Owner       bool   `json:"owner"`
	Permissions string `json:"permissions"`
}

type serverSummary struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	IconURL string `json:"iconUrl"`
}

type discordGuildMember struct {
	Roles []string `json:"roles"`
}

func (s *Server) handleAuthLogin(w http.ResponseWriter, r *http.Request) {
	// Start OAuth login and set CSRF state cookie.
	state, err := randomState(24)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to init auth"})
		return
	}

	setStateCookie(w, state, s.Config)

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

	if !validateStateCookie(r, state) {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid state"})
		return
	}

	token, err := exchangeDiscordToken(r.Context(), s.Config, code)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "token exchange failed"})
		return
	}

	user, err := fetchDiscordUser(r.Context(), token.AccessToken)
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

	setAuthCookie(w, jwtToken, s.Config)
	clearStateCookie(w, s.Config)

	http.Redirect(w, r, s.Config.ClientOrigin, http.StatusFound)
}

func (s *Server) handleAuthLogout(w http.ResponseWriter, r *http.Request) {
	clearAuthCookie(w, s.Config)
	writeJSON(w, http.StatusOK, map[string]string{"status": "logged out"})
}

func (s *Server) handleAuthMe(w http.ResponseWriter, r *http.Request) {
	claims, err := s.authFromRequest(r)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	serverID := r.URL.Query().Get("server_id")
	authorized := true
	if serverID != "" {
		// Optional server authorization check.
		authorized, err = s.isAuthorizedForServer(r.Context(), serverID, claims)
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
	claims, err := s.authFromRequest(r)
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

	guilds, err := fetchDiscordGuilds(r.Context(), claims.AccessToken)
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
			IconURL: guildIconURL(g),
		})
	}

	writeJSON(w, http.StatusOK, map[string]any{"servers": servers})
}

func (s *Server) authFromRequest(r *http.Request) (*authClaims, error) {
	cookie, err := r.Cookie(authCookieName)
	if err != nil || cookie.Value == "" {
		return nil, errors.New("missing auth cookie")
	}

	token, err := jwt.ParseWithClaims(cookie.Value, &authClaims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return []byte(s.Config.JwtSecret), nil
	})
	if err != nil || !token.Valid {
		return nil, errors.New("invalid token")
	}

	claims, ok := token.Claims.(*authClaims)
	if !ok {
		return nil, errors.New("invalid claims")
	}
	return claims, nil
}

func (s *Server) signJWT(user discordUser, name, image string, token *discordTokenResponse) (string, error) {
	expiresAt := time.Now().Add(7 * 24 * time.Hour)
	claims := authClaims{
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

func (s *Server) isAuthorizedForServer(ctx context.Context, serverID string, claims *authClaims) (bool, error) {
	id, err := strconv.ParseInt(serverID, 10, 64)
	if err != nil {
		return false, err
	}

	cfg, err := s.DB.GetServerConfig(ctx, id)
	if err != nil {
		return false, err
	}

	if containsString(cfg.AuthorizedMemberIds, claims.DiscordID) {
		return true, nil
	}

	if claims.AccessToken != "" {
		ok, err := s.hasGuildPerms(claims.AccessToken, serverID)
		if err == nil && ok {
			return true, nil
		}
	}

	if len(cfg.AuthorizedRoleIds) > 0 {
		ok, err := s.memberHasRole(serverID, claims.DiscordID, cfg.AuthorizedRoleIds)
		if err == nil && ok {
			return true, nil
		}
	}

	return false, nil
}

func (s *Server) isAuthorizedGuild(ctx context.Context, guild discordGuild, claims *authClaims) (bool, error) {
	if guildIsAdmin(guild) {
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

	if containsString(cfg.AuthorizedMemberIds, claims.DiscordID) {
		return true, nil
	}

	if len(cfg.AuthorizedRoleIds) == 0 {
		return false, nil
	}

	member, err := fetchGuildMember(ctx, s.Config.BotToken, guild.ID, claims.DiscordID)
	if err != nil {
		return false, err
	}
	for _, roleID := range member.Roles {
		if containsString(cfg.AuthorizedRoleIds, roleID) {
			return true, nil
		}
	}
	return false, nil
}

func (s *Server) hasGuildPerms(accessToken, guildID string) (bool, error) {
	guilds, err := fetchDiscordGuilds(context.Background(), accessToken)
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
		if perms&permAdministrator != 0 || perms&permManageGuild != 0 {
			return true, nil
		}
		return false, nil
	}

	return false, nil
}

func (s *Server) memberHasRole(guildID, userID string, allowedRoles []string) (bool, error) {
	if s.Config.BotToken == "" {
		return false, errors.New("missing bot token")
	}

	member, err := fetchGuildMember(context.Background(), s.Config.BotToken, guildID, userID)
	if err != nil {
		return false, err
	}

	for _, roleID := range member.Roles {
		if containsString(allowedRoles, roleID) {
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

func guildIsAdmin(guild discordGuild) bool {
	if guild.Owner {
		return true
	}
	perms, err := strconv.ParseInt(guild.Permissions, 10, 64)
	if err != nil {
		return false
	}
	return perms&permAdministrator != 0 || perms&permManageGuild != 0
}

func guildIconURL(guild discordGuild) string {
	if guild.Icon == "" {
		return ""
	}
	return fmt.Sprintf("https://cdn.discordapp.com/icons/%s/%s.png", guild.ID, guild.Icon)
}

func exchangeDiscordToken(ctx context.Context, cfg *config.Config, code string) (*discordTokenResponse, error) {
	data := url.Values{}
	data.Set("client_id", cfg.DiscordClientID)
	data.Set("client_secret", cfg.DiscordClientSecret)
	data.Set("grant_type", "authorization_code")
	data.Set("code", code)
	data.Set("redirect_uri", cfg.DiscordRedirectURL)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, discordAPIBase+"/oauth2/token", strings.NewReader(data.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("token exchange failed: %s", string(body))
	}

	var out discordTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, err
	}
	return &out, nil
}

func fetchDiscordUser(ctx context.Context, accessToken string) (*discordUser, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, discordAPIBase+"/users/@me", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("fetch user failed: %s", string(body))
	}

	var out discordUser
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, err
	}
	return &out, nil
}

func fetchDiscordGuilds(ctx context.Context, accessToken string) ([]discordGuild, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, discordAPIBase+"/users/@me/guilds", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("fetch guilds failed: %s", string(body))
	}

	var out []discordGuild
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, err
	}
	return out, nil
}

func fetchGuildMember(ctx context.Context, botToken, guildID, userID string) (*discordGuildMember, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, discordAPIBase+"/guilds/"+guildID+"/members/"+userID, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bot "+botToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("fetch member failed: %s", string(body))
	}

	var out discordGuildMember
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, err
	}
	return &out, nil
}

func setStateCookie(w http.ResponseWriter, state string, cfg *config.Config) {
	cookie := &http.Cookie{
		Name:     stateCookieName,
		Value:    state,
		Path:     "/",
		HttpOnly: true,
		Secure:   cfg.CookieSecure,
		SameSite: cookieSameSite(cfg),
		MaxAge:   300,
	}
	http.SetCookie(w, cookie)
}

func clearStateCookie(w http.ResponseWriter, cfg *config.Config) {
	cookie := &http.Cookie{
		Name:     stateCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   cfg.CookieSecure,
		SameSite: cookieSameSite(cfg),
		MaxAge:   -1,
	}
	http.SetCookie(w, cookie)
}

func validateStateCookie(r *http.Request, state string) bool {
	cookie, err := r.Cookie(stateCookieName)
	if err != nil {
		return false
	}
	return cookie.Value == state
}

func setAuthCookie(w http.ResponseWriter, token string, cfg *config.Config) {
	cookie := &http.Cookie{
		Name:     authCookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   cfg.CookieSecure,
		SameSite: cookieSameSite(cfg),
		MaxAge:   int((7 * 24 * time.Hour).Seconds()),
	}
	http.SetCookie(w, cookie)
}

func clearAuthCookie(w http.ResponseWriter, cfg *config.Config) {
	cookie := &http.Cookie{
		Name:     authCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   cfg.CookieSecure,
		SameSite: cookieSameSite(cfg),
		MaxAge:   -1,
	}
	http.SetCookie(w, cookie)
}

func cookieSameSite(cfg *config.Config) http.SameSite {
	if cfg.CookieSecure {
		return http.SameSiteNoneMode
	}
	return http.SameSiteLaxMode
}

func randomState(size int) (string, error) {
	buf := make([]byte, size)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf), nil
}

func containsString(list []string, value string) bool {
	for _, v := range list {
		if v == value {
			return true
		}
	}
	return false
}
