import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

export const locales = ['en', 'he', 'es'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const rtlLocales: Locale[] = ['he']

export function isRtl(locale: string): boolean {
  return rtlLocales.includes(locale as Locale)
}

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const messages = (
    await import(`../messages/${locale}.json`)
  ).default as Record<string, unknown>

  return {
    locale: locale as string,
    messages,
    timeZone: 'Asia/Jerusalem',
  }
})
