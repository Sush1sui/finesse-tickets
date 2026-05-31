CREATE TABLE IF NOT EXISTS auth_session (
    session_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    discord_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    image TEXT,
    access_token TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    last_seen BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS idempotency_key (
    key TEXT NOT NULL,
    user_id TEXT NOT NULL,
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    request_hash TEXT NOT NULL,
    response_code INTEGER NOT NULL,
    response_body BYTEA NOT NULL,
    response_content_type TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    PRIMARY KEY (key, user_id)
);
