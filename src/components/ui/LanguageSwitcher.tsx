'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

const LOCALES = [
  { value: 'en', label: 'EN' },
  { value: 'he', label: 'HE' },
  { value: 'es', label: 'ES' },
]

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale(newLocale: string) {
    // pathname is like /en/... or /he/...
    // Replace the first segment with the new locale
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Language">
      {LOCALES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => switchLocale(value)}
          aria-pressed={locale === value}
          className={`px-2 py-1 rounded-full text-xs font-outfit font-medium transition-colors duration-150 ${
            locale === value
              ? 'bg-purple-600 text-white'
              : 'border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
