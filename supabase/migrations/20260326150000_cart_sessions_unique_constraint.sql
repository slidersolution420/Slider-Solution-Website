-- Replace the partial unique index with a proper unique constraint
-- so upsert ON CONFLICT (email) works correctly.
DROP INDEX IF EXISTS cart_sessions_email_unique;
ALTER TABLE cart_sessions
  ADD CONSTRAINT cart_sessions_email_key UNIQUE (email);
