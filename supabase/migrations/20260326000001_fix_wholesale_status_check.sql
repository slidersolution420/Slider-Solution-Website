-- Migration: Allow 'pending' as a valid wholesale account status
-- The signup API inserts status='pending' for new applicants awaiting review,
-- but the original constraint only allowed 'active' and 'blocked'.

ALTER TABLE wholesale_accounts
  DROP CONSTRAINT wholesale_accounts_status_check;

ALTER TABLE wholesale_accounts
  ADD CONSTRAINT wholesale_accounts_status_check
  CHECK (status IN ('active', 'blocked', 'pending'));
