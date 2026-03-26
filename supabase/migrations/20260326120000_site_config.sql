-- Runtime site configuration — editable via admin dashboard without rebuilds.
-- Values are stored as JSONB so each can hold a scalar, array, or object.

CREATE TABLE IF NOT EXISTS site_config (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- Seed with current values from static JSON files
INSERT INTO site_config (key, value) VALUES
  ('price_b2c_usd',           '25'),
  ('price_b2b_usd',           '82'),
  ('stock',                   '999'),
  ('ticker_he',               '"✦ משלוח חינם בכל הארץ ✦ ממציאי הסלייד המקוריים ✦ +1,000 לקוחות מרוצים ✦"'),
  ('ticker_en',               '"✦ Free Shipping Nationwide ✦ The Original Slider Kit ✦ 1,000+ Happy Customers ✦"'),
  ('instagram_url',           '"https://www.instagram.com/slider.solution"'),
  ('facebook_url',            '"https://www.facebook.com/profile.php?id=100094631066285"'),
  ('whatsapp_number',         '""'),
  ('instagram_reels',         '[]'),
  ('free_shipping_countries', '["IL"]'),
  ('free_shipping_min_qty',   '3'),
  ('intl_paid_shipping_usd',  '25'),
  ('age_gate_enabled',        'true')
ON CONFLICT (key) DO NOTHING;

-- Lock down public access — only service role can read/write
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "no_public_access" ON site_config
  USING (false);
