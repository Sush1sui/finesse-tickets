package db

import "context"

type IdempotencyRecord struct {
	Key                 string
	UserID              string
	Method              string
	Path                string
	RequestHash         string
	ResponseCode        int32
	ResponseBody        []byte
	ResponseContentType string
	CreatedAt           int64
	ExpiresAt           int64
}

type CreateIdempotencyRecordParams struct {
	Key                 string
	UserID              string
	Method              string
	Path                string
	RequestHash         string
	ResponseCode        int32
	ResponseBody        []byte
	ResponseContentType string
	CreatedAt           int64
	ExpiresAt           int64
}

const getIdempotencyRecord = `-- name: GetIdempotencyRecord :one
SELECT key, user_id, method, path, request_hash, response_code,
       response_body, response_content_type, created_at, expires_at
FROM idempotency_key
WHERE key = $1 AND user_id = $2
LIMIT 1
`

func (q *Queries) GetIdempotencyRecord(ctx context.Context, key, userID string) (IdempotencyRecord, error) {
	row := q.db.QueryRow(ctx, getIdempotencyRecord, key, userID)
	var r IdempotencyRecord
	err := row.Scan(
		&r.Key,
		&r.UserID,
		&r.Method,
		&r.Path,
		&r.RequestHash,
		&r.ResponseCode,
		&r.ResponseBody,
		&r.ResponseContentType,
		&r.CreatedAt,
		&r.ExpiresAt,
	)
	return r, err
}

const createIdempotencyRecord = `-- name: CreateIdempotencyRecord :exec
INSERT INTO idempotency_key (
    key, user_id, method, path, request_hash, response_code,
    response_body, response_content_type, created_at, expires_at
) VALUES (
    $1, $2, $3, $4, $5, $6,
    $7, $8, $9, $10
)
`

func (q *Queries) CreateIdempotencyRecord(ctx context.Context, arg CreateIdempotencyRecordParams) error {
	_, err := q.db.Exec(ctx, createIdempotencyRecord,
		arg.Key,
		arg.UserID,
		arg.Method,
		arg.Path,
		arg.RequestHash,
		arg.ResponseCode,
		arg.ResponseBody,
		arg.ResponseContentType,
		arg.CreatedAt,
		arg.ExpiresAt,
	)
	return err
}

const deleteExpiredIdempotencyRecords = `-- name: DeleteExpiredIdempotencyRecords :exec
DELETE FROM idempotency_key WHERE expires_at < $1
`

func (q *Queries) DeleteExpiredIdempotencyRecords(ctx context.Context, now int64) error {
	_, err := q.db.Exec(ctx, deleteExpiredIdempotencyRecords, now)
	return err
}

const deleteIdempotencyRecord = `-- name: DeleteIdempotencyRecord :exec
DELETE FROM idempotency_key WHERE key = $1 AND user_id = $2
`

func (q *Queries) DeleteIdempotencyRecord(ctx context.Context, key, userID string) error {
	_, err := q.db.Exec(ctx, deleteIdempotencyRecord, key, userID)
	return err
}
