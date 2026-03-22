-- Migration: Create wholesale_accounts table
-- Wave 0 — Foundation

CREATE TABLE IF NOT EXISTS wholesale_accounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  contact_name  TEXT NOT NULL,
  phone         TEXT NOT NULL,
  username      TEXT NOT NULL UNIQUE,
  store_name    TEXT NOT NULL,
  address       TEXT NOT NULL,
  city          TEXT NOT NULL,
  country       TEXT NOT NULL,
  zip           TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'blocked')),
  approved_at   TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index: one wholesale account per user
CREATE UNIQUE INDEX IF NOT EXISTS wholesale_accounts_user_id_idx
  ON wholesale_accounts (user_id);

-- Username lookup
CREATE UNIQUE INDEX IF NOT EXISTS wholesale_accounts_username_idx
  ON wholesale_accounts (username);

-- Auto-update updated_at
CREATE TRIGGER wholesale_accounts_updated_at
  BEFORE UPDATE ON wholesale_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE wholesale_accounts ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own account
CREATE POLICY "Users can view own wholesale account"
  ON wholesale_accounts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own wholesale account"
  ON wholesale_accounts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Service role full access (admin / webhook)
CREATE POLICY "Service role full access"
  ON wholesale_accounts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
