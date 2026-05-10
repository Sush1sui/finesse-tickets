-- sql/schema.sql

CREATE TABLE server_config (
    id BIGINT PRIMARY KEY,
    ticket_name_style TEXT NOT NULL,
    ticket_transcript_cid TEXT,
    max_ticket_per_user INTEGER NOT NULL DEFAULT 2,
    ticket_permissions JSONB,
    max_panel INTEGER DEFAULT 3,
    max_multi_panel INTEGER DEFAULT 3,
    authorized_member_ids TEXT[],
    authorized_role_ids TEXT[]
);

CREATE TABLE auto_close_config (
    server_config_id BIGINT NOT NULL UNIQUE REFERENCES server_config(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT false,
    close_on_user_leave BOOLEAN NOT NULL DEFAULT false,
    close_since_open_with_no_response_mins INTEGER,
    close_since_last_message_mins INTEGER,
    PRIMARY KEY (server_config_id)
);

CREATE TABLE panel_config (
    id SERIAL PRIMARY KEY,
    server_config_id BIGINT NOT NULL REFERENCES server_config(id) ON DELETE CASCADE,
    mention_roles_on_open TEXT[],
    category_id TEXT,
    title TEXT NOT NULL,
    content TEXT,
    embed_color INTEGER NOT NULL,
    channel_id TEXT NOT NULL,
    btn_color TEXT NOT NULL,
    btn_txt TEXT NOT NULL,
    btn_emoji TEXT,
    large_img_url TEXT,
    small_img_url TEXT
);

CREATE TABLE questions_config (
    id SERIAL PRIMARY KEY,
    panel_config_id INTEGER NOT NULL REFERENCES panel_config(id) ON DELETE CASCADE,
    questions TEXT[]
);

CREATE TABLE welcome_msg_config (
    id SERIAL PRIMARY KEY,
    panel_config_id INTEGER NOT NULL REFERENCES panel_config(id) ON DELETE CASCADE,
    embed_color INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    title_url TEXT,
    large_img_url TEXT,
    small_img_url TEXT,
    footer TEXT,
    footer_icon_url TEXT
);

CREATE TABLE multi_panel_config (
    id SERIAL PRIMARY KEY,
    server_config_id BIGINT NOT NULL REFERENCES server_config(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    embed_color INTEGER NOT NULL,
    channel_id TEXT NOT NULL,
    large_img_url TEXT,
    small_img_url TEXT,
    use_dropdown BOOLEAN NOT NULL,
    panel_config_ids INTEGER[],
    footer TEXT,
    foot_icon_url TEXT
);

CREATE TABLE transcript (
    id SERIAL PRIMARY KEY,
    server_config_id BIGINT NOT NULL REFERENCES server_config(id) ON DELETE CASCADE,
    opened_at BIGINT NOT NULL,
    closed_at BIGINT NOT NULL,
    closed_by TEXT NOT NULL,
    storage_key TEXT NOT NULL
);