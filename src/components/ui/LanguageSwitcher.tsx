'use client'

import { useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  // Eagerly prefetch the other locale so the switch is instant
  useEffect(() => {
    router.prefetch(pathname, { locale: locale === 'he' ? 'en' : 'he' })
  }, [pathname, locale, router])

  return (
    <div className="flex items-center gap-1 rounded-lg bg-white/10 p-1">
      <Link
        href={pathname}
        locale="he"
        className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
          locale === 'he' ? 'bg-brand-500 text-white' : 'text-gray-300 hover:text-white'
        }`}
      >
        עב
      </Link>
      <Link
        href={pathname}
        locale="en"
        className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
          locale === 'en' ? 'bg-brand-500 text-white' : 'text-gray-300 hover:text-white'
        }`}
      >
        EN
      </Link>
    </div>
  )
}
