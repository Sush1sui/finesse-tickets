-- name: GetServerConfig :one
SELECT * FROM server_config 
WHERE id = $1 LIMIT 1;

-- name: UpsertServerConfig :one
-- Upsert means "Insert if it doesn't exist, Update if it does"
INSERT INTO server_config (
    id, ticket_name_style, ticket_transcript_cid, max_ticket_per_user, 
    ticket_permissions, max_panel, max_multi_panel, authorized_member_ids, authorized_role_ids
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9
)
ON CONFLICT (id) DO UPDATE SET
    ticket_name_style = EXCLUDED.ticket_name_style,
    ticket_transcript_cid = EXCLUDED.ticket_transcript_cid,
    max_ticket_per_user = EXCLUDED.max_ticket_per_user,
    ticket_permissions = EXCLUDED.ticket_permissions,
    max_panel = EXCLUDED.max_panel,
    max_multi_panel = EXCLUDED.max_multi_panel,
    authorized_member_ids = EXCLUDED.authorized_member_ids,
    authorized_role_ids = EXCLUDED.authorized_role_ids
RETURNING *;

-- name: GetAutoCloseConfig :one
SELECT * FROM auto_close_config
WHERE server_config_id = $1 LIMIT 1;

-- name: UpsertAutoCloseConfig :one
INSERT INTO auto_close_config (
    server_config_id, is_active, close_on_user_leave,
    close_since_open_with_no_response_mins, close_since_last_message_mins
) VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (server_config_id) DO UPDATE SET
    is_active = EXCLUDED.is_active,
    close_on_user_leave = EXCLUDED.close_on_user_leave,
    close_since_open_with_no_response_mins = EXCLUDED.close_since_open_with_no_response_mins,
    close_since_last_message_mins = EXCLUDED.close_since_last_message_mins
RETURNING *;

-- name: GetTranscriptsByServer :many
-- Paginated list for dashboard — only summary columns, no blob fetch
SELECT id, server_config_id, ticket_id, username, user_id,
       opened_at, closed_at, closed_by, storage_key,
       total_messages, total_attachments, total_embeds
FROM transcript
WHERE server_config_id = $1
ORDER BY closed_at DESC
LIMIT $2 OFFSET $3;

-- name: CountTranscriptsByServer :one
-- Total count for pagination — uses index, minimal compute
SELECT COUNT(*) FROM transcript WHERE server_config_id = $1;

-- name: GetTranscriptByID :one
-- Single row lookup for viewer — returns storage_key for presigned URL
SELECT * FROM transcript WHERE id = $1 AND server_config_id = $2;

-- name: CreateTranscript :one
-- Used by the bot when a ticket is closed and uploaded to Azure Blob
INSERT INTO transcript (
    server_config_id, ticket_id, username, user_id,
    opened_at, closed_at, closed_by, storage_key,
    total_messages, total_attachments, total_embeds
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
) RETURNING *;