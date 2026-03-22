'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { useStore } from '@/store'
import { trackOpenWholesale } from '@/lib/analytics'
import CurrencySwitcher from './CurrencySwitcher'
import LanguageSwitcher from './LanguageSwitcher'

export default function Footer() {
  const t = useTranslations('footer')
  const locale = useLocale()
  const openModal = useStore((s) => s.openModal)

  function handleWholesale() {
    openModal('wholesale')
    trackOpenWholesale({ source: 'footer' })
  }

  return (
    <footer className="bg-[#0F1629] border-t border-white/5 pt-12 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Logo + tagline */}
          <div className="space-y-1">
            <div className="tracking-[0.3em] text-lg font-syne font-bold text-white uppercase">
              S L I D E R
            </div>
            <p className="text-sm font-outfit text-gray-500">{t('tagline')}</p>
          </div>

          {/* Switchers */}
          <div className="flex items-center gap-4 flex-wrap">
            <CurrencySwitcher />
            <LanguageSwitcher />
          </div>
        </div>

        {/* Nav links */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-outfit text-gray-400">
          <Link
            href={`/${locale}`}
            className="hover:text-white transition-colors"
          >
            {t('home')}
          </Link>
          <Link
            href={`/${locale}/reviews`}
            className="hover:text-white transition-colors"
          >
            {t('reviews')}
          </Link>
          <button
            onClick={handleWholesale}
            className="hover:text-white transition-colors"
          >
            {t('wholesale')}
          </button>
        </div>

        {/* Social + wholesale CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Social */}
          <div className="flex items-center gap-4 text-sm font-outfit text-gray-400">
            <a
              href="https://www.facebook.com/profile.php?id=100094631066285"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              {t('social_facebook')}
            </a>
            <a
              href="https://www.instagram.com/slider.solution/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              {t('social_instagram')}
            </a>
          </div>

          {/* Wholesale CTA */}
          <button
            onClick={handleWholesale}
            className="text-sm font-outfit text-purple-400 hover:text-purple-300 transition-colors"
          >
            {t('wholesale_cta')}
          </button>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-outfit text-gray-600">
          <p>{t('copyright')}</p>
          <div className="flex gap-4">
            <span className="hover:text-gray-400 cursor-pointer transition-colors">
              {t('privacy')}
            </span>
            <span className="hover:text-gray-400 cursor-pointer transition-colors">
              {t('terms')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
