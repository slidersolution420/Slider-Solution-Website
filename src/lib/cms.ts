/**
 * CMS content reader backed by Supabase cms_* tables.
 * Drop-in replacement for lib/keystatic.ts — identical function signatures and types.
 *
 * Falls back to empty defaults if Supabase is unreachable.
 * Server-only — never import in Client Components.
 */
import { createServiceClient } from '@/lib/supabase-server'

// ── Locale-aware field helper ────────────────────────────────────────────────
// Usage: localized(item, 'title', locale) → item.title_es ?? item.title_en
// Falls back to English when the requested locale column is empty or missing.

export function localized<T extends Record<string, unknown>>(
  obj: T,
  field: string,
  locale: string,
): string {
  const val = obj[`${field}_${locale}`]
  if (typeof val === 'string' && val) return val
  // Fallback to English
  const fallback = obj[`${field}_en`]
  return typeof fallback === 'string' ? fallback : ''
}

/** Like localized() but for array fields (e.g. sections, kit_contents). */
export function localizedArray<V>(
  obj: Record<string, unknown>,
  field: string,
  locale: string,
): V[] {
  const val = obj[`${field}_${locale}`]
  if (Array.isArray(val) && val.length > 0) return val as V[]
  const fallback = obj[`${field}_en`]
  return Array.isArray(fallback) ? (fallback as V[]) : []
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface ColorItem {
  name_he: string
  name_en: string
  name_es?: string
  slug: string
  image: string
  gradient: string
  [key: string]: unknown // allow localized() to access dynamic locale fields
}

export interface FeatureItem {
  title_he: string
  title_en: string
  title_es?: string
  desc_he: string
  desc_en: string
  desc_es?: string
  icon: string
  [key: string]: unknown
}

export interface StepItem {
  title_he: string
  title_en: string
  title_es?: string
  desc_he: string
  desc_en: string
  desc_es?: string
  [key: string]: unknown
}

export interface ProductContent {
  name: string
  tagline_he: string
  tagline_en: string
  tagline_es?: string
  description_he: string
  description_en: string
  description_es?: string
  price_b2c_usd: number
  price_b2b_usd: number
  image_b2c: string
  image_b2b: string
  colors: ColorItem[]
  features: FeatureItem[]
  steps: StepItem[]
  kit_contents_he: string[]
  kit_contents_en: string[]
  kit_contents_es?: string[]
  stock: number
  [key: string]: unknown
}

export interface FaqItem {
  slug: string
  question_he: string
  question_en: string
  question_es?: string
  answer_he: string
  answer_en: string
  answer_es?: string
  order: number
  [key: string]: unknown
}

export interface PageSection {
  heading?: string
  text: string
}

export interface PageContent {
  title_he: string
  title_en: string
  title_es?: string
  sections_he: PageSection[]
  sections_en: PageSection[]
  sections_es?: PageSection[]
  [key: string]: unknown
}

// ── Defaults (shown if Supabase unreachable) ──────────────────────────────────

const PRODUCT_DEFAULTS: ProductContent = {
  name: 'SLIDER',
  tagline_he: 'קיט הגלגול המושלם',
  tagline_en: 'The Original All-in-One Cone Kit',
  description_he: '',
  description_en: '',
  price_b2c_usd: 25,
  price_b2b_usd: 82,
  image_b2c: 'kit-main.jpg',
  image_b2b: 'display-box.jpg',
  colors: [],
  features: [],
  steps: [],
  kit_contents_he: [],
  kit_contents_en: [],
  stock: 999,
}

// ── Simple TTL cache (same pattern as lib/config.ts) ─────────────────────────

const CACHE_TTL_MS = 60_000

let productCache: ProductContent | null = null
let productCachedAt = 0

let faqCache: FaqItem[] | null = null
let faqCachedAt = 0

// ── Product copy ─────────────────────────────────────────────────────────────

export async function getProduct(): Promise<ProductContent> {
  if (productCache && Date.now() - productCachedAt < CACHE_TTL_MS) {
    return productCache
  }

  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('cms_product_copy')
      .select('data')
      .eq('key', 'main')
      .single()

    if (error ?? !data) return PRODUCT_DEFAULTS

    productCache = data.data as ProductContent
    productCachedAt = Date.now()
    return productCache
  } catch {
    return PRODUCT_DEFAULTS
  }
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

export async function getFaq(): Promise<FaqItem[]> {
  if (faqCache && Date.now() - faqCachedAt < CACHE_TTL_MS) {
    return faqCache
  }

  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('cms_faq')
      .select('slug, question_he, question_en, question_es, answer_he, answer_en, answer_es, sort_order')
      .order('sort_order', { ascending: true })

    if (error ?? !data) return []

    faqCache = data.map((row) => ({
      slug: row.slug as string,
      question_he: row.question_he as string,
      question_en: row.question_en as string,
      question_es: (row.question_es as string) || '',
      answer_he: row.answer_he as string,
      answer_en: row.answer_en as string,
      answer_es: (row.answer_es as string) || '',
      order: row.sort_order as number,
    }))
    faqCachedAt = Date.now()
    return faqCache
  } catch {
    return []
  }
}

// ── Pages ─────────────────────────────────────────────────────────────────────

export async function getPage(slug: string): Promise<PageContent | null> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('cms_pages')
      .select('title_he, title_en, title_es, sections_he, sections_en, sections_es')
      .eq('slug', slug)
      .single()

    if (error ?? !data) return null

    return {
      title_he: data.title_he as string,
      title_en: data.title_en as string,
      title_es: (data.title_es as string) || '',
      sections_he: data.sections_he as PageSection[],
      sections_en: data.sections_en as PageSection[],
      sections_es: (data.sections_es as PageSection[]) || [],
    }
  } catch {
    return null
  }
}

export async function getAllPageSlugs(): Promise<string[]> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('cms_pages')
      .select('slug')

    if (error ?? !data) return ['terms', 'refund', 'cookies']

    return data.map((row) => row.slug as string)
  } catch {
    return ['terms', 'refund', 'cookies']
  }
}

// ── Cache invalidation (called after admin saves) ─────────────────────────────

export function invalidateCmsCache(type: 'product' | 'faq' | 'all') {
  if (type === 'product' || type === 'all') {
    productCache = null
    productCachedAt = 0
  }
  if (type === 'faq' || type === 'all') {
    faqCache = null
    faqCachedAt = 0
  }
}
