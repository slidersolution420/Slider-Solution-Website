/**
 * Keystatic content reader.
 *
 * Singletons (fixed paths) use static imports so they're always bundled.
 * Collections (FAQ, pages) use fs reads so new items added via the CMS
 * are discovered automatically — no code changes needed.
 *
 * The content/ directory is included in Vercel serverless bundles via
 * outputFileTracingIncludes in next.config.ts.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, basename } from 'node:path'

import productData          from '../../content/singletons/product.json'
import siteSettingsData     from '../../content/singletons/site-settings.json'
import shippingSettingsData from '../../content/singletons/shipping-settings.json'

export type ProductContent   = typeof productData
export type ShippingSettings = typeof shippingSettingsData

export interface ReelItem {
  video_url: string
  link_url: string | null
}

export type SiteSettings = Omit<typeof siteSettingsData, 'instagram_reels'> & {
  instagram_reels: ReelItem[]
}

export interface FaqItem {
  slug: string
  question_he: string
  question_en: string
  answer_he: string
  answer_en: string
  order: number
}

export interface PageSection {
  heading?: string
  text: string
}

export interface PageContent {
  title_he: string
  title_en: string
  sections_he: PageSection[]
  sections_en: PageSection[]
}

// ---------------------------------------------------------------------------
// Singletons — static imports (paths never change)
// ---------------------------------------------------------------------------

export async function getProduct(): Promise<ProductContent> {
  return productData
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return siteSettingsData as SiteSettings
}

export async function getShippingSettings(): Promise<ShippingSettings> {
  return shippingSettingsData
}

// ---------------------------------------------------------------------------
// Collections — dynamic fs reads (auto-discover new CMS items)
// ---------------------------------------------------------------------------

function readJsonDir<T>(dir: string): Array<T & { slug: string }> {
  const absDir = join(process.cwd(), dir)
  const files = readdirSync(absDir).filter((f) => f.endsWith('.json'))
  return files.map((file) => {
    const raw = readFileSync(join(absDir, file), 'utf-8')
    const data = JSON.parse(raw) as T
    return { slug: basename(file, '.json'), ...data }
  })
}

export async function getFaq(): Promise<FaqItem[]> {
  const items = readJsonDir<Omit<FaqItem, 'slug'>>('content/faq')
  return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export async function getPage(slug: string): Promise<PageContent | null> {
  const pages = readJsonDir<PageContent>('content/pages')
  return pages.find((p) => p.slug === slug) ?? null
}

export async function getAllPageSlugs(): Promise<string[]> {
  const pages = readJsonDir<PageContent>('content/pages')
  return pages.map((p) => p.slug)
}
