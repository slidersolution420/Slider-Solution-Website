/**
 * Keystatic content — read via static imports so Vercel bundles the files.
 *
 * The Keystatic CMS UI (GitHub mode) commits JSON changes to the repo and
 * triggers a Vercel redeploy on every save, so content is always up to date
 * after each CMS edit without any filesystem access at runtime.
 */
import productData          from '../../content/singletons/product.json'
import siteSettingsData     from '../../content/singletons/site-settings.json'
import shippingSettingsData from '../../content/singletons/shipping-settings.json'

import faqWhatIsIncluded  from '../../content/faq/what-is-included.json'
import faqGrinderNoJam    from '../../content/faq/grinder-no-jam.json'
import faqStorageCapacity from '../../content/faq/storage-capacity.json'
import faqNoCones         from '../../content/faq/refund-policy.json'
import faqFutureProducts  from '../../content/faq/future-products.json'
import faqFreeKit         from '../../content/faq/free-kit.json'
import faqShippingTime    from '../../content/faq/shipping-time.json'

import termsPage   from '../../content/pages/terms.json'
import refundPage  from '../../content/pages/refund.json'
import cookiesPage from '../../content/pages/cookies.json'

export type ProductContent   = typeof productData
export type SiteSettings     = typeof siteSettingsData
export type ShippingSettings = typeof shippingSettingsData
export type FaqItem          = typeof faqWhatIsIncluded & { slug: string }

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

export async function getProduct(): Promise<ProductContent> {
  return productData
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return siteSettingsData
}

export async function getShippingSettings(): Promise<ShippingSettings> {
  return shippingSettingsData
}

export async function getFaq(): Promise<FaqItem[]> {
  const items: FaqItem[] = [
    { slug: 'what-is-included',  ...faqWhatIsIncluded },
    { slug: 'grinder-no-jam',    ...faqGrinderNoJam },
    { slug: 'storage-capacity',  ...faqStorageCapacity },
    { slug: 'no-cones',          ...faqNoCones },
    { slug: 'future-products',   ...faqFutureProducts },
    { slug: 'free-kit',          ...faqFreeKit },
    { slug: 'shipping-time',     ...faqShippingTime },
  ]
  return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

const pageMap: Record<string, PageContent> = {
  terms:   termsPage,
  refund:  refundPage,
  cookies: cookiesPage,
}

export async function getPage(slug: string): Promise<PageContent | null> {
  return pageMap[slug] ?? null
}

export async function getAllPageSlugs(): Promise<string[]> {
  return Object.keys(pageMap)
}
