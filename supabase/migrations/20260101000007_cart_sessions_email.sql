-- Add email column to cart_sessions for abandoned cart tracking
-- Safe to run even if column already exists

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_sessions' AND column_name = 'email'
  ) THEN
    ALTER TABLE cart_sessions ADD COLUMN email text;
    CREATE INDEX IF NOT EXISTS cart_sessions_email_idx ON cart_sessions (email);
  END IF;
END $$;

-- Allow upsert by email
CREATE UNIQUE INDEX IF NOT EXISTS cart_sessions_email_unique
  ON cart_sessions (email)
  WHERE email IS NOT NULL;
