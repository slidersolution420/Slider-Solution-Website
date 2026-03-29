/**
 * One-time seed script: migrate Keystatic JSON content into Supabase CMS tables.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-cms.mjs
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'node:fs'
import { join, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

function readJson(path) {
  return JSON.parse(readFileSync(join(ROOT, path), 'utf-8'))
}

function readJsonDir(dir) {
  const absDir = join(ROOT, dir)
  return readdirSync(absDir)
    .filter((f) => f.endsWith('.json'))
    .map((file) => ({
      slug: basename(file, '.json'),
      ...JSON.parse(readFileSync(join(absDir, file), 'utf-8')),
    }))
}

// ── 1. Product copy ──────────────────────────────────────────────────────────

console.log('Seeding cms_product_copy...')
const product = readJson('content/singletons/product.json')

const { error: productErr } = await supabase
  .from('cms_product_copy')
  .upsert({ key: 'main', data: product }, { onConflict: 'key' })

if (productErr) {
  console.error('cms_product_copy error:', productErr.message)
  process.exit(1)
}
console.log('  ✓ product copy seeded')

// ── 2. FAQ items ─────────────────────────────────────────────────────────────

console.log('Seeding cms_faq...')
const faqFiles = readJsonDir('content/faq')

for (const item of faqFiles) {
  const { error } = await supabase
    .from('cms_faq')
    .upsert(
      {
        slug: item.slug,
        question_he: item.question_he,
        question_en: item.question_en,
        answer_he: item.answer_he,
        answer_en: item.answer_en,
        sort_order: item.order ?? 0,
      },
      { onConflict: 'slug' },
    )
  if (error) {
    console.error(`  cms_faq [${item.slug}] error:`, error.message)
    process.exit(1)
  }
  console.log(`  ✓ faq: ${item.slug}`)
}

// ── 3. Pages ─────────────────────────────────────────────────────────────────

console.log('Seeding cms_pages...')
const pageFiles = readJsonDir('content/pages')

for (const page of pageFiles) {
  const { error } = await supabase
    .from('cms_pages')
    .upsert(
      {
        slug: page.slug,
        title_he: page.title_he,
        title_en: page.title_en,
        sections_he: page.sections_he,
        sections_en: page.sections_en,
      },
      { onConflict: 'slug' },
    )
  if (error) {
    console.error(`  cms_pages [${page.slug}] error:`, error.message)
    process.exit(1)
  }
  console.log(`  ✓ page: ${page.slug}`)
}

console.log('\nAll done! CMS tables seeded successfully.')
console.log('You can now delete the content/ directory and remove Keystatic packages.')
