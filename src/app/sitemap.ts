import type { MetadataRoute } from 'next'
import { getAllPageSlugs } from '@/lib/keystatic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://slidersolution.com'
const LOCALES = ['he', 'en'] as const

function url(path: string, locale: string) {
  if (locale === 'he') return `${APP_URL}${path}`
  return `${APP_URL}/en${path}`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pageSlugs = await getAllPageSlugs()

  const staticRoutes = ['', '/contact', '/wholesale']
  const entries: MetadataRoute.Sitemap = []

  for (const locale of LOCALES) {
    for (const route of staticRoutes) {
      entries.push({
        url: url(route || '/', locale),
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1 : 0.7,
      })
    }
    for (const slug of pageSlugs) {
      entries.push({
        url: url(`/${slug}`, locale),
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.3,
      })
    }
  }

  return entries
}
