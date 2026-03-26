/**
 * Keystatic content — read via static imports so Vercel bundles the files.
 *
 * The Keystatic CMS UI (GitHub mode) commits JSON changes to the repo and
 * triggers a Vercel redeploy on every save, so content is always up to date
 * after each CMS edit without any filesystem access at runtime.
 */
import productData      from '../../content/singletons/product.json'
import siteSettingsData from '../../content/singletons/site-settings.json'

import faqGrinderNoJam    from '../../content/faq/grinder-no-jam.json'
import faqRefundPolicy    from '../../content/faq/refund-policy.json'
import faqShippingTime    from '../../content/faq/shipping-time.json'
import faqStorageCapacity from '../../content/faq/storage-capacity.json'
import faqWhatIsIncluded  from '../../content/faq/what-is-included.json'

export type ProductContent = typeof productData
export type SiteSettings   = typeof siteSettingsData
export type FaqItem        = typeof faqWhatIsIncluded & { slug: string }

export async function getProduct(): Promise<ProductContent> {
  return productData
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return siteSettingsData
}

export async function getFaq(): Promise<FaqItem[]> {
  const items: FaqItem[] = [
    { slug: 'grinder-no-jam',    ...faqGrinderNoJam },
    { slug: 'refund-policy',     ...faqRefundPolicy },
    { slug: 'shipping-time',     ...faqShippingTime },
    { slug: 'storage-capacity',  ...faqStorageCapacity },
    { slug: 'what-is-included',  ...faqWhatIsIncluded },
  ]
  return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

// Pages use MDX — static import not possible; return null until a pages
// feature is implemented that reads from GitHub or a build-time data source.
export interface PageContent {
  title_he: string
  title_en: string
  body: unknown
}

export async function getPage(_slug: string): Promise<PageContent | null> {
  return null
}

export async function getAllPageSlugs(): Promise<string[]> {
  return []
}
