package tickets

import (
	"github.com/Sush1sui/FNS_BOT/internal/db"
	"github.com/Sush1sui/FNS_BOT/internal/storage"
)

var queries *db.Queries
var storageClient *storage.Client

func SetQueries(q *db.Queries) {
	queries = q
}

func SetStorage(c *storage.Client) {
	storageClient = c
}
