-- CMS tables replacing Keystatic JSON files.
-- All three tables are read-public (anon), write-service-role.

CREATE TABLE IF NOT EXISTS cms_faq (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        text UNIQUE NOT NULL,
  question_he text NOT NULL DEFAULT '',
  question_en text NOT NULL DEFAULT '',
  answer_he   text NOT NULL DEFAULT '',
  answer_en   text NOT NULL DEFAULT '',
  sort_order  int  NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE cms_faq ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read faq"   ON cms_faq FOR SELECT USING (true);
CREATE POLICY "service write faq" ON cms_faq USING (auth.role() = 'service_role');


CREATE TABLE IF NOT EXISTS cms_pages (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        text UNIQUE NOT NULL,
  title_he    text NOT NULL DEFAULT '',
  title_en    text NOT NULL DEFAULT '',
  sections_he jsonb NOT NULL DEFAULT '[]',
  sections_en jsonb NOT NULL DEFAULT '[]',
  created_at  timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read pages"   ON cms_pages FOR SELECT USING (true);
CREATE POLICY "service write pages" ON cms_pages USING (auth.role() = 'service_role');


CREATE TABLE IF NOT EXISTS cms_product_copy (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key        text UNIQUE NOT NULL,
  data       jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE cms_product_copy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read product_copy"   ON cms_product_copy FOR SELECT USING (true);
CREATE POLICY "service write product_copy" ON cms_product_copy USING (auth.role() = 'service_role');
