-- Migration: Add Tapuz delivery columns to orders table

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_number TEXT,
  ADD COLUMN IF NOT EXISTS tapuz_branch    TEXT,
  ADD COLUMN IF NOT EXISTS tapuz_error     TEXT,
  ADD COLUMN IF NOT EXISTS tapuz_sent_at   TIMESTAMPTZ;
