import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['en', 'he', 'es']
  const baseUrl = 'https://slidersolution.com'
  const pages = ['', '/reviews']

  return locales.flatMap((locale) =>
    pages.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page === '' ? 1 : 0.8,
    })),
  )
}
