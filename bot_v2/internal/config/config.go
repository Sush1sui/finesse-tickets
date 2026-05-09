package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port     string
	DBUrl    string
	BotToken string

	DiscordClientID     string
	DiscordClientSecret string
	DiscordRedirectURL  string
	JwtSecret           string
	ClientOrigin        string
	CookieSecure        bool
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

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET is required in .env")
	}

	clientOrigin := os.Getenv("CLIENT_ORIGIN")
	if clientOrigin == "" {
		log.Fatal("CLIENT_ORIGIN is required in .env")
	}

	cookieSecure := os.Getenv("COOKIE_SECURE") == "true"

	return &Config{
		Port:     port,
		DBUrl:    dbUrl,
		BotToken: botToken,

		DiscordClientID:     discordClientID,
		DiscordClientSecret: discordClientSecret,
		DiscordRedirectURL:  discordRedirectURL,
		JwtSecret:           jwtSecret,
		ClientOrigin:        clientOrigin,
		CookieSecure:        cookieSecure,
	}
}
