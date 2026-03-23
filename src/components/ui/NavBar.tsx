'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useStore } from '@/store'
import { trackOpenWholesale } from '@/lib/analytics'
import CurrencySwitcher from './CurrencySwitcher'
import LanguageSwitcher from './LanguageSwitcher'

export default function NavBar() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const openModal = useStore((s) => s.openModal)
  const isWholesaleUser = useStore((s) => s.isWholesaleUser)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleWholesale() {
    openModal('wholesale')
    trackOpenWholesale({ source: 'navbar' })
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-md bg-[#07080F]/80 border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="tracking-[0.3em] text-lg font-syne font-bold text-white uppercase select-none shrink-0">
          S L I D E R
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <CurrencySwitcher />
          <LanguageSwitcher />

          {isWholesaleUser ? (
            <Link
              href={`/${locale}/wholesale`}
              className="px-4 py-1.5 rounded-full border border-purple-600 text-purple-400 hover:bg-purple-600/10 font-outfit font-medium text-sm transition-colors duration-150 whitespace-nowrap"
            >
              {t('my_orders')}
            </Link>
          ) : (
            <button
              onClick={handleWholesale}
              className="px-4 py-1.5 rounded-full border border-purple-600 text-purple-400 hover:bg-purple-600/10 font-outfit font-medium text-sm transition-colors duration-150 whitespace-nowrap"
            >
              {t('wholesale')}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
