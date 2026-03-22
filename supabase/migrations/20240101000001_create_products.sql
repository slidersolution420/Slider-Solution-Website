-- Migration: Create products table
-- Wave 0 — Foundation

CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  color       TEXT NOT NULL CHECK (color IN ('black', 'blue', 'purple')),
  sku         TEXT NOT NULL UNIQUE,
  price_usd   NUMERIC(10, 2) NOT NULL CHECK (price_usd > 0),
  type        TEXT NOT NULL CHECK (type IN ('b2c', 'b2b')),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can read B2C products
CREATE POLICY "Public can view b2c products"
  ON products
  FOR SELECT
  USING (type = 'b2c');

-- Only active wholesale users can view B2B products
-- (wholesale_accounts table must exist first — see migration 000005)
-- This policy references wholesale_accounts; it's applied after that migration.
-- Placeholder: actual RLS for b2b is in migration 000006.

-- Seed B2C products
INSERT INTO products (name, color, sku, price_usd, type, stock) VALUES
  ('Slider Cone Kit — Black',  'black',  'SCK-B2C-BLK', 25.00, 'b2c', 999),
  ('Slider Cone Kit — Blue',   'blue',   'SCK-B2C-BLU', 25.00, 'b2c', 999),
  ('Slider Cone Kit — Purple', 'purple', 'SCK-B2C-PRP', 25.00, 'b2c', 999),
  ('Slider Wholesale Box',     'black',  'SCK-B2B-BOX', 82.00, 'b2b', 999)
ON CONFLICT (sku) DO NOTHING;
