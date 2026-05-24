package tickets

import "github.com/Sush1sui/FNS_BOT/internal/db"

var queries *db.Queries

func SetQueries(q *db.Queries) {
	queries = q
}
