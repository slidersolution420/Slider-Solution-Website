-- Migration: Create cart_sessions table (abandoned cart tracking)
-- Wave 0 — Foundation

CREATE TABLE IF NOT EXISTS cart_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  cart       JSONB NOT NULL,
  status     TEXT NOT NULL DEFAULT 'active'
               CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for cron job: find active sessions older than 60 minutes
CREATE INDEX IF NOT EXISTS cart_sessions_status_created_idx
  ON cart_sessions (status, created_at);

-- Index for email lookups (update on purchase)
CREATE INDEX IF NOT EXISTS cart_sessions_email_idx
  ON cart_sessions (email);

-- Auto-update updated_at
CREATE TRIGGER cart_sessions_updated_at
  BEFORE UPDATE ON cart_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE cart_sessions ENABLE ROW LEVEL SECURITY;

-- No public access — all reads/writes via service role only
CREATE POLICY "Service role full access"
  ON cart_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
