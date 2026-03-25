-- Seed data for Slider Solution
-- Run once: npx supabase db seed
-- Idempotent: uses ON CONFLICT DO NOTHING

-- ─── B2C Products (3 colors at $25 each) ────────────────────────────────────

INSERT INTO products (name, color, sku, price_usd, type, stock) VALUES
  ('Slider Cone Kit — Black',  'black',  'SCK-B2C-BLK', 25.00, 'b2c', 999),
  ('Slider Cone Kit — Blue',   'blue',   'SCK-B2C-BLU', 25.00, 'b2c', 999),
  ('Slider Cone Kit — Purple', 'purple', 'SCK-B2C-PRP', 25.00, 'b2c', 999)
ON CONFLICT (sku) DO NOTHING;

-- ─── B2B Product (display box at $82) ───────────────────────────────────────
-- Note: DB color constraint is ('black','blue','purple'). B2B box uses 'black'
-- as the DB color; the "mixed" concept is presentation-layer only.

INSERT INTO products (name, color, sku, price_usd, type, stock) VALUES
  ('Slider Display Box — Mixed (12-Pack)', 'black', 'SCK-B2B-BOX', 82.00, 'b2b', 999)
ON CONFLICT (sku) DO NOTHING;

-- ─── Approved Reviews ───────────────────────────────────────────────────────

INSERT INTO reviews (name, rating, body, approved) VALUES
  ('Matan', 5, 'Amazing product, ordered and arrived quickly. Useful and convenient. Been waiting a long time for something like this.', true),
  ('Em', 4, 'Initially had trouble with the grinder. After watching the how-to videos it''s crystal clear. Can''t imagine rolling without it now.', true),
  ('Dana', 5, 'Perfect kit. Does exactly what it says. The tray is a game changer outdoors.', true)
ON CONFLICT DO NOTHING;
