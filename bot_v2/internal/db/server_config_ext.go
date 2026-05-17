package db

import "context"

// EnsureServerConfig inserts a minimal server_config row if missing.
func (q *Queries) EnsureServerConfig(ctx context.Context, serverID int64) error {
	_, err := q.db.Exec(
		ctx,
		"INSERT INTO server_config (id, ticket_name_style) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING",
		serverID,
		"number",
	)
	return err
}
