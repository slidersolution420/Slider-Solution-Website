-- Add German locale columns to CMS tables
-- Same pattern as 20260330000001_add_es_columns_to_cms.sql

ALTER TABLE cms_faq
  ADD COLUMN IF NOT EXISTS question_de text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS answer_de text NOT NULL DEFAULT '';

ALTER TABLE cms_pages
  ADD COLUMN IF NOT EXISTS title_de text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sections_de jsonb NOT NULL DEFAULT '[]'::jsonb;
