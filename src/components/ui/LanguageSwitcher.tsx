'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { useStore } from '@/store'
import { localeConfig, routing } from '@/i18n/routing'
import type { Locale } from '@/i18n/routing'

const localeLabels: Record<Locale, string> = {
  en: 'English (USD $)',
  he: 'עברית (₪ ILS)',
}

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()
  const setCurrency = useStore((s) => s.setCurrency)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Eagerly prefetch other locales so the switch is instant
  useEffect(() => {
    routing.locales
      .filter((l) => l !== locale)
      .forEach((l) => router.prefetch(pathname, { locale: l }))
  }, [pathname, locale, router])

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-md border border-white/20 px-2.5 py-1.5 text-xs text-gray-200 transition-colors hover:border-white/40 hover:text-white"
      >
        {localeLabels[locale]}
        <ChevronDownIcon
          className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute end-0 top-full z-50 mt-1.5 min-w-[160px] overflow-hidden rounded-md border border-white/10 bg-gray-900 shadow-xl">
          {routing.locales.map((loc) => (
            <Link
              key={loc}
              href={pathname}
              locale={loc}
              onClick={() => {
                setCurrency(localeConfig[loc as Locale].currency)
                setOpen(false)
              }}
              className={`block w-full px-3 py-2 text-start text-xs transition-colors ${
                locale === loc
                  ? 'bg-white/10 font-medium text-white'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {localeLabels[loc as Locale]}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
