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

	return &Config{
		Port:     port,
		DBUrl:    dbUrl,
		BotToken: botToken,
	}
}
