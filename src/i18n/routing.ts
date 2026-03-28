import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['he', 'en'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // 'en' has no prefix, '/he' has prefix
})

export type Locale = (typeof routing.locales)[number]

export function isRtl(locale: string): boolean {
  return locale === 'he'
}
