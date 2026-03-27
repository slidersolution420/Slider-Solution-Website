'use client'

import { useLocale } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-1 rounded-lg bg-white/10 p-1">
      <Link
        href={pathname}
        locale="he"
        unstable_viewTransition
        className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
          locale === 'he' ? 'bg-brand-500 text-white' : 'text-gray-300 hover:text-white'
        }`}
      >
        עב
      </Link>
      <Link
        href={pathname}
        locale="en"
        unstable_viewTransition
        className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
          locale === 'en' ? 'bg-brand-500 text-white' : 'text-gray-300 hover:text-white'
        }`}
      >
        EN
      </Link>
    </div>
  )
}
