-- Migration: Create reviews table
-- Wave 0 — Foundation

CREATE TABLE IF NOT EXISTS reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body       TEXT NOT NULL,
  approved   BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for approved reviews (ISR page query)
CREATE INDEX IF NOT EXISTS reviews_approved_idx ON reviews (approved, created_at DESC);

-- Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public can view approved reviews only
CREATE POLICY "Public can view approved reviews"
  ON reviews
  FOR SELECT
  USING (approved = true);

-- No public INSERT — reviews submitted via service role only
-- (future: admin approval flow)

-- Service role full access (admin moderation)
CREATE POLICY "Service role full access"
  ON reviews
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Seed sample reviews (approved)
INSERT INTO reviews (name, rating, body, approved) VALUES
  ('Danny K.', 5, 'Best kit I''ve ever used. Grinder works perfectly and the tray is a game changer outdoors.', true),
  ('Sarah M.', 5, 'Patent protected and you can tell — this thing is built different. Love it.', true),
  ('Avi T.', 5, 'Got mine delivered to Israel super fast. Already ordered 3 more as gifts.', true),
  ('Marco R.', 4, 'Shipped to Spain, arrived in 12 days. Works flawlessly. 5 stars on quality.', true),
  ('Lior B.', 5, 'The funnel is genius. No mess ever. Worth every shekel.', true)
ON CONFLICT DO NOTHING;
