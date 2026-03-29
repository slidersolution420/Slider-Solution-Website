-- Add How It Works YouTube video IDs to site_config.
-- These were previously stored in content/singletons/site-settings.json (Keystatic).
INSERT INTO site_config (key, value) VALUES
  ('how_it_works_video1_id', '"8Q1pkRmLpQ4"'),
  ('how_it_works_video2_id', '"MByE89tX2og"')
ON CONFLICT (key) DO NOTHING;
