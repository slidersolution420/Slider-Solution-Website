'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  function switchLocale(newLocale: 'he' | 'en') {
    const navigate = () => { router.replace(pathname, { locale: newLocale }) }
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      document.startViewTransition(navigate)
    } else {
      navigate()
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
