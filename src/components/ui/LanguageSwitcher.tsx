'use client'

import { useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { useStore } from '@/store'
import { localeConfig, routing } from '@/i18n/routing'
import type { Locale } from '@/i18n/routing'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const setCurrency = useStore((s) => s.setCurrency)

  // Eagerly prefetch other locales so the switch is instant
  useEffect(() => {
    routing.locales
      .filter((l) => l !== locale)
      .forEach((l) => router.prefetch(pathname, { locale: l }))
  }, [pathname, locale, router])

  return (
    <div className="flex items-center gap-1 rounded-lg bg-white/10 p-1">
      {routing.locales.map((loc) => (
        <Link
          key={loc}
          href={pathname}
          locale={loc}
          onClick={() => setCurrency(localeConfig[loc as Locale].currency)}
          className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
            locale === loc ? 'bg-brand-500 text-white' : 'text-gray-300 hover:text-white'
          }`}
        >
          {localeConfig[loc as Locale].label}
        </Link>
      ))}
    </div>
  )
}
