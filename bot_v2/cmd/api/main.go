package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/Sush1sui/FNS_BOT/internal/api"
	"github.com/Sush1sui/FNS_BOT/internal/config"
	"github.com/Sush1sui/FNS_BOT/internal/db"
	"github.com/Sush1sui/FNS_BOT/internal/storage"
	"github.com/jackc/pgx/v5"
)

func main() {
	cfg := config.Load()

	// 1. Connect to PostgreSQL
	ctx := context.Background()
	conn, err := pgx.Connect(ctx, cfg.DBUrl)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer conn.Close(ctx)

	queries := db.New(conn)

	// 2. Connect to Azure Blob Storage
	azureClient := storage.NewAzureClient()

	// 3. Mount Router
	mux := api.NewRouter(queries, azureClient)

	// 4. Start Server
	fmt.Printf("🚀 Finesse API flying on port %s\n", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, mux); err != nil {
		log.Fatal(err)
	}
}
