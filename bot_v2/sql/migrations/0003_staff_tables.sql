CREATE TABLE authorized_members (
    server_config_id BIGINT NOT NULL REFERENCES server_config(id) ON DELETE CASCADE,
    member_id TEXT NOT NULL,
    PRIMARY KEY (server_config_id, member_id)
);

CREATE TABLE authorized_roles (
    server_config_id BIGINT NOT NULL REFERENCES server_config(id) ON DELETE CASCADE,
    role_id TEXT NOT NULL,
    PRIMARY KEY (server_config_id, role_id)
);

CREATE INDEX idx_am_member ON authorized_members (member_id);
CREATE INDEX idx_ar_role ON authorized_roles (role_id);

ALTER TABLE server_config DROP COLUMN IF EXISTS authorized_member_ids;
ALTER TABLE server_config DROP COLUMN IF EXISTS authorized_role_ids;
