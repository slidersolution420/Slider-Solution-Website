INSERT INTO site_config (key, value)
VALUES ('ticker_enabled', 'true')
ON CONFLICT (key) DO NOTHING;
