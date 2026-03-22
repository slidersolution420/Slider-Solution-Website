-- Migration: Create orders table
-- Wave 0 — Foundation

CREATE TABLE IF NOT EXISTS orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 TEXT NOT NULL,
  name                  TEXT NOT NULL,
  shipping_address      JSONB NOT NULL,
  country               TEXT NOT NULL,
  items                 JSONB NOT NULL,
  total_usd             NUMERIC(10, 2) NOT NULL CHECK (total_usd >= 0),
  status                TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded')),
  hype_payment_id       TEXT,
  tapuz_tracking_number TEXT,
  type                  TEXT NOT NULL DEFAULT 'b2c'
                          CHECK (type IN ('b2c', 'b2b')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for email lookups (customer order history)
CREATE INDEX IF NOT EXISTS orders_email_idx ON orders (email);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);

-- Index for payment id lookups (webhook processing)
CREATE INDEX IF NOT EXISTS orders_hype_payment_id_idx ON orders (hype_payment_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view their own orders (by email match)
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- Service role can do everything (webhooks, admin)
CREATE POLICY "Service role full access"
  ON orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
