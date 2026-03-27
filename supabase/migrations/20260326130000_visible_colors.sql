INSERT INTO site_config (key, value)
VALUES ('visible_colors', '["purple"]')
ON CONFLICT (key) DO NOTHING;
