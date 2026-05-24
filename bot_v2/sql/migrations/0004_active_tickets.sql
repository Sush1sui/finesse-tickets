CREATE TABLE IF NOT EXISTS active_ticket (
    server_config_id BIGINT NOT NULL REFERENCES server_config(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    PRIMARY KEY (server_config_id, channel_id)
);

CREATE INDEX IF NOT EXISTS idx_active_ticket_user ON active_ticket (server_config_id, user_id);
