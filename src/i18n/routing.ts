import { defineRouting } from 'next-intl/routing'

export const localeConfig = {
  en: { currency: 'USD', dir: 'ltr', label: 'EN' },
  he: { currency: 'ILS', dir: 'rtl', label: 'עב' },
  es: { currency: 'EUR', dir: 'ltr', label: 'ES' },
} as const

export type Locale = keyof typeof localeConfig

export const routing = defineRouting({
  locales: Object.keys(localeConfig) as [Locale, ...Locale[]],
  defaultLocale: 'en' satisfies Locale,
  localePrefix: 'as-needed', // 'en' has no prefix, '/he' has prefix
})

export function isRtl(locale: string): boolean {
  return localeConfig[locale as Locale]?.dir === 'rtl'
}
