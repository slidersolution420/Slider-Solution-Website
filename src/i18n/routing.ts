import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['he', 'en'],
  defaultLocale: 'he',
  localePrefix: 'as-needed', // 'he' has no prefix, '/en' has prefix
})

export type Locale = (typeof routing.locales)[number]

export function isRtl(locale: string): boolean {
  return locale === 'he'
}
