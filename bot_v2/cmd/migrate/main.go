// cmd/migrate/main.go
package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/Sush1sui/FNS_BOT/internal/config"
	"github.com/jackc/pgx/v5"
)

func main() {
	// 1. Load the database URL
	cfg := config.Load()

	// 2. Connect to Neon
	ctx := context.Background()
	conn, err := pgx.Connect(ctx, cfg.DBUrl)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer conn.Close(ctx)

	// 3. Read the schema file
	sqlBytes, err := os.ReadFile("sql/schema.sql")
	if err != nil {
		log.Fatalf("Could not read schema.sql: %v\n", err)
	}

	// 4. Execute the SQL against Neon
	fmt.Println("Applying migrations to Neon Database...")
	_, err = conn.Exec(ctx, string(sqlBytes))
	if err != nil {
		log.Fatalf("Migration failed: %v\n", err)
	}

	fmt.Println("✅ Migration successful! Your tables are ready.")
}
