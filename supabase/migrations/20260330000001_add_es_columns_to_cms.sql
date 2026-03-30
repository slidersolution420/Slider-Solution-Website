-- Add Spanish locale columns to CMS tables
-- Pattern: every _he/_en pair gets a corresponding _es column
-- When adding a new locale (e.g. German), duplicate this migration with _de columns

-- FAQ table
ALTER TABLE cms_faq
  ADD COLUMN IF NOT EXISTS question_es text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS answer_es text NOT NULL DEFAULT '';

-- Pages table
ALTER TABLE cms_pages
  ADD COLUMN IF NOT EXISTS title_es text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sections_es jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Note: cms_product_copy stores data as a single JSONB blob in the `data` column.
-- Spanish fields (tagline_es, description_es, color name_es, feature title_es/desc_es, etc.)
-- are added directly inside the JSON structure via the admin dashboard.
-- No DDL change needed for that table.
