package db

import "context"

type AuthSession struct {
	SessionID   string
	UserID      string
	DiscordID   string
	Name        string
	Email       string
	Image       string
	AccessToken string
	CreatedAt   int64
	ExpiresAt   int64
	LastSeen    int64
}

type CreateAuthSessionParams struct {
	SessionID   string
	UserID      string
	DiscordID   string
	Name        string
	Email       string
	Image       string
	AccessToken string
	CreatedAt   int64
	ExpiresAt   int64
	LastSeen    int64
}

const createAuthSession = `-- name: CreateAuthSession :exec
INSERT INTO auth_session (
    session_id, user_id, discord_id, name, email, image, access_token,
    created_at, expires_at, last_seen
) VALUES (
    $1, $2, $3, $4, $5, $6, $7,
    $8, $9, $10
)
`

func (q *Queries) CreateAuthSession(ctx context.Context, arg CreateAuthSessionParams) error {
	_, err := q.db.Exec(ctx, createAuthSession,
		arg.SessionID,
		arg.UserID,
		arg.DiscordID,
		arg.Name,
		arg.Email,
		arg.Image,
		arg.AccessToken,
		arg.CreatedAt,
		arg.ExpiresAt,
		arg.LastSeen,
	)
	return err
}

const getAuthSession = `-- name: GetAuthSession :one
SELECT session_id, user_id, discord_id, name, email, image, access_token,
       created_at, expires_at, last_seen
FROM auth_session
WHERE session_id = $1
LIMIT 1
`

func (q *Queries) GetAuthSession(ctx context.Context, sessionID string) (AuthSession, error) {
	row := q.db.QueryRow(ctx, getAuthSession, sessionID)
	var s AuthSession
	err := row.Scan(
		&s.SessionID,
		&s.UserID,
		&s.DiscordID,
		&s.Name,
		&s.Email,
		&s.Image,
		&s.AccessToken,
		&s.CreatedAt,
		&s.ExpiresAt,
		&s.LastSeen,
	)
	return s, err
}

const updateAuthSessionLastSeen = `-- name: UpdateAuthSessionLastSeen :exec
UPDATE auth_session SET last_seen = $2 WHERE session_id = $1
`

func (q *Queries) UpdateAuthSessionLastSeen(ctx context.Context, sessionID string, lastSeen int64) error {
	_, err := q.db.Exec(ctx, updateAuthSessionLastSeen, sessionID, lastSeen)
	return err
}

const updateAuthSessionAccessToken = `-- name: UpdateAuthSessionAccessToken :exec
UPDATE auth_session SET access_token = $2 WHERE session_id = $1
`

func (q *Queries) UpdateAuthSessionAccessToken(ctx context.Context, sessionID, accessToken string) error {
	_, err := q.db.Exec(ctx, updateAuthSessionAccessToken, sessionID, accessToken)
	return err
}

const deleteAuthSession = `-- name: DeleteAuthSession :exec
DELETE FROM auth_session WHERE session_id = $1
`

func (q *Queries) DeleteAuthSession(ctx context.Context, sessionID string) error {
	_, err := q.db.Exec(ctx, deleteAuthSession, sessionID)
	return err
}

const deleteExpiredAuthSessions = `-- name: DeleteExpiredAuthSessions :exec
DELETE FROM auth_session WHERE expires_at <= $1
`

func (q *Queries) DeleteExpiredAuthSessions(ctx context.Context, now int64) error {
	_, err := q.db.Exec(ctx, deleteExpiredAuthSessions, now)
	return err
}
