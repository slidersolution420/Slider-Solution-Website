-- Migration: RLS for B2B products — only active wholesale users can SELECT
-- Wave 0 — Foundation
-- Depends on: products (000001), wholesale_accounts (000003)

-- Drop the placeholder policy from migration 000001 if it exists
DROP POLICY IF EXISTS "Active wholesale users can view b2b products" ON products;

-- B2B products: only accessible to authenticated users with an active wholesale account
CREATE POLICY "Active wholesale users can view b2b products"
  ON products
  FOR SELECT
  TO authenticated
  USING (
    type = 'b2c'
    OR (
      type = 'b2b'
      AND EXISTS (
        SELECT 1
        FROM wholesale_accounts wa
        WHERE wa.user_id = auth.uid()
          AND wa.status = 'active'
      )
    )
  );

-- Service role can access everything
CREATE POLICY "Service role full access on products"
  ON products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
