/**
 * CMS content reader backed by Supabase cms_* tables.
 * Drop-in replacement for lib/keystatic.ts — identical function signatures and types.
 *
 * Falls back to empty defaults if Supabase is unreachable.
 * Server-only — never import in Client Components.
 */
import { createServiceClient } from '@/lib/supabase-server'

// ── Types ────────────────────────────────────────────────────────────────────

export interface ColorItem {
  name_he: string
  name_en: string
  slug: string
  image: string
  gradient: string
}

export interface FeatureItem {
  title_he: string
  title_en: string
  desc_he: string
  desc_en: string
  icon: string
}

export interface StepItem {
  title_he: string
  title_en: string
  desc_he: string
  desc_en: string
}

export interface ProductContent {
  name: string
  tagline_he: string
  tagline_en: string
  description_he: string
  description_en: string
  price_b2c_usd: number
  price_b2b_usd: number
  image_b2c: string
  image_b2b: string
  colors: ColorItem[]
  features: FeatureItem[]
  steps: StepItem[]
  kit_contents_he: string[]
  kit_contents_en: string[]
  stock: number
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
      .select('slug, question_he, question_en, answer_he, answer_en, sort_order')
      .order('sort_order', { ascending: true })

    if (error ?? !data) return []

    faqCache = data.map((row) => ({
      slug: row.slug as string,
      question_he: row.question_he as string,
      question_en: row.question_en as string,
      answer_he: row.answer_he as string,
      answer_en: row.answer_en as string,
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
      .select('title_he, title_en, sections_he, sections_en')
      .eq('slug', slug)
      .single()

    if (error ?? !data) return null

    return {
      title_he: data.title_he as string,
      title_en: data.title_en as string,
      sections_he: data.sections_he as PageSection[],
      sections_en: data.sections_en as PageSection[],
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
