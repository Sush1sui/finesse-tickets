package config

import (
	"encoding/base64"
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port     string
	DBUrl    string
	BotToken string

	DiscordClientID     string
	DiscordClientSecret string
	DiscordRedirectURL  string
	ClientOrigin        string
	CookieSecure        bool
	TrustedProxies      []string
	AccessTokenKey      []byte
}

func Load() *Config {
	// Ignore error, in production you might pass env vars directly without a .env file
	_ = godotenv.Load()

	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		log.Fatal("DATABASE_URL is required in .env")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	botToken := os.Getenv("BOT_TOKEN")
	if botToken == "" {
		log.Fatal("BOT_TOKEN is required in .env")
	}

	discordClientID := os.Getenv("DISCORD_CLIENT_ID")
	if discordClientID == "" {
		log.Fatal("DISCORD_CLIENT_ID is required in .env")
	}

	discordClientSecret := os.Getenv("DISCORD_CLIENT_SECRET")
	if discordClientSecret == "" {
		log.Fatal("DISCORD_CLIENT_SECRET is required in .env")
	}

	discordRedirectURL := os.Getenv("DISCORD_REDIRECT_URL")
	if discordRedirectURL == "" {
		log.Fatal("DISCORD_REDIRECT_URL is required in .env")
	}

	clientOrigin := os.Getenv("CLIENT_ORIGIN")
	if clientOrigin == "" {
		log.Fatal("CLIENT_ORIGIN is required in .env")
	}

	cookieSecure := os.Getenv("COOKIE_SECURE") == "true"

	accessTokenKeyStr := os.Getenv("ACCESS_TOKEN_KEY")
	if accessTokenKeyStr == "" {
		log.Fatal("ACCESS_TOKEN_KEY is required in .env")
	}
	accessTokenKey, err := base64.StdEncoding.DecodeString(accessTokenKeyStr)
	if err != nil || len(accessTokenKey) != 32 {
		log.Fatal("ACCESS_TOKEN_KEY must be base64 for 32 bytes")
	}

	trustedProxiesStr := os.Getenv("TRUSTED_PROXIES")
	var trustedProxies []string
	if trustedProxiesStr != "" {
		for _, p := range strings.Split(trustedProxiesStr, ",") {
			p = strings.TrimSpace(p)
			if p != "" {
				trustedProxies = append(trustedProxies, p)
			}
		}
	}
	if len(trustedProxies) == 0 {
		trustedProxies = []string{"127.0.0.1", "::1"}
	}

	return &Config{
		Port:     port,
		DBUrl:    dbUrl,
		BotToken: botToken,

		DiscordClientID:     discordClientID,
		DiscordClientSecret: discordClientSecret,
		DiscordRedirectURL:  discordRedirectURL,
		ClientOrigin:        clientOrigin,
		CookieSecure:        cookieSecure,
		TrustedProxies:      trustedProxies,
		AccessTokenKey:      accessTokenKey,
	}
}
