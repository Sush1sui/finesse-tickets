-- Add columns to transcript table for dashboard list view
-- Avoids fetching the full blob from Azure just to show summary info
ALTER TABLE transcript ADD COLUMN IF NOT EXISTS ticket_id TEXT;
ALTER TABLE transcript ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE transcript ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE transcript ADD COLUMN IF NOT EXISTS total_messages INTEGER DEFAULT 0;
ALTER TABLE transcript ADD COLUMN IF NOT EXISTS total_attachments INTEGER DEFAULT 0;
ALTER TABLE transcript ADD COLUMN IF NOT EXISTS total_embeds INTEGER DEFAULT 0;
