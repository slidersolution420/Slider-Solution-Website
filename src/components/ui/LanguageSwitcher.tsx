'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'

interface LanguageSwitcherProps {
  locale: string
}

export default function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale(newLocale: string) {
    if (newLocale === locale) return

    if (locale === 'he') {
      // Hebrew is default (no prefix) → switching to English adds /en
      router.push(`/en${pathname}`)
    } else {
      // English has /en prefix → switching to Hebrew removes it
      const withoutPrefix = pathname.replace(/^\/en/, '') || '/'
      router.push(withoutPrefix)
    }
  }

  return (
    <div className="flex items-center gap-1 rounded-lg bg-white/10 p-1">
      <button
        onClick={() => switchLocale('he')}
        className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
          locale === 'he' ? 'bg-brand-500 text-white' : 'text-gray-300 hover:text-white'
        }`}
      >
        עב
      </button>
      <button
        onClick={() => switchLocale('en')}
        className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
          locale === 'en' ? 'bg-brand-500 text-white' : 'text-gray-300 hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  )
}
