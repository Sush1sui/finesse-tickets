package db

import "context"

const countActiveTicketsByUser = `
SELECT COUNT(*)
FROM active_ticket
WHERE server_config_id = $1 AND user_id = $2
`

func (q *Queries) CountActiveTicketsByUser(ctx context.Context, serverConfigID int64, userID string) (int64, error) {
	row := q.db.QueryRow(ctx, countActiveTicketsByUser, serverConfigID, userID)
	var count int64
	if err := row.Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}

const createActiveTicket = `
INSERT INTO active_ticket (server_config_id, user_id, channel_id, created_at)
VALUES ($1, $2, $3, $4)
ON CONFLICT (server_config_id, channel_id) DO NOTHING
`

func (q *Queries) CreateActiveTicket(ctx context.Context, serverConfigID int64, userID, channelID string, createdAt int64) error {
	_, err := q.db.Exec(ctx, createActiveTicket, serverConfigID, userID, channelID, createdAt)
	return err
}

const deleteActiveTicketByChannel = `
DELETE FROM active_ticket
WHERE server_config_id = $1 AND channel_id = $2
`

func (q *Queries) DeleteActiveTicketByChannel(ctx context.Context, serverConfigID int64, channelID string) error {
	_, err := q.db.Exec(ctx, deleteActiveTicketByChannel, serverConfigID, channelID)
	return err
}
