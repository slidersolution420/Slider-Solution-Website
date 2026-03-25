-- supabase/seed.sql
-- Run with: supabase db reset --local
-- Or manually: psql $DB_URL < supabase/seed.sql
-- Uses ON CONFLICT DO NOTHING — safe to run multiple times.

-- ─── Reviews ─────────────────────────────────────────────────────────────────

INSERT INTO reviews (name, rating, body, approved, created_at) VALUES
  ('Matan', 5,
   'Amazing product, ordered and arrived quickly. Useful and convenient. Been waiting a long time for something like this.',
   true, now() - interval '30 days'),
  ('Em', 4,
   'Initially had trouble with the grinder. After watching the how-to videos it''s crystal clear. Can''t imagine rolling without it now.',
   true, now() - interval '20 days'),
  ('Dana', 5,
   'Perfect kit. Does exactly what it says. The tray is a game changer outdoors.',
   true, now() - interval '10 days'),
  ('Danny K.', 5,
   'Best kit I''ve ever used. Grinder works perfectly and the tray is a game changer outdoors.',
   true, now() - interval '25 days'),
  ('Lior B.', 5,
   'The funnel is genius. No mess ever. Worth every shekel.',
   true, now() - interval '5 days')
ON CONFLICT DO NOTHING;

-- ─── Products ─────────────────────────────────────────────────────────────────

INSERT INTO products (name, color, sku, price_usd, type, stock) VALUES
  ('Slider Cone Kit — Black',  'black',  'SCK-B2C-BLK', 25.00, 'b2c', 999),
  ('Slider Cone Kit — Blue',   'blue',   'SCK-B2C-BLU', 25.00, 'b2c', 999),
  ('Slider Cone Kit — Purple', 'purple', 'SCK-B2C-PRP', 25.00, 'b2c', 999),
  ('Slider Wholesale Box',     'black',  'SCK-B2B-BOX', 82.00, 'b2b', 999)
ON CONFLICT (sku) DO NOTHING;
