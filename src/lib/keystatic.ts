/**
 * Keystatic content reader utilities.
 * Used in Server Components to read content from the filesystem.
 */
import { createReader } from '@keystatic/core/reader'
import config from '../../keystatic.config'

export const reader = createReader(process.cwd(), config)

export type ProductContent = Awaited<ReturnType<typeof getProduct>>
export type SiteSettings = Awaited<ReturnType<typeof getSiteSettings>>
export type FaqItem = Awaited<ReturnType<typeof getFaq>>[number]

export async function getProduct() {
  const data = await reader.singletons.product.read()
  if (!data) throw new Error('Product content not found in Keystatic')
  return data
}

export async function getSiteSettings() {
  const data = await reader.singletons.siteSettings.read()
  if (!data) throw new Error('Site settings not found in Keystatic')
  return data
}

export async function getFaq() {
  const slugs = await reader.collections.faq.list()
  const items = await Promise.all(
    slugs.map(async (slug) => {
      const item = await reader.collections.faq.read(slug)
      if (!item) return null
      return { slug, ...item }
    })
  )
  return items
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export async function getPage(slug: string) {
  const page = await reader.collections.pages.read(slug)
  return page ?? null
}

export async function getAllPageSlugs() {
  return reader.collections.pages.list()
}
