'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useStore } from '@/store'
import { trackViewProduct } from '@/lib/analytics'
import { B2C_PRICE_USD } from '@/lib/currency'
import ColorSwatch from './ColorSwatch'
import type { ProductColor } from '@/lib/types'

// Gradient placeholder per color until Cloudinary assets provided
const COLOR_GRADIENTS: Record<ProductColor, string> = {
  black: 'from-gray-900 to-gray-700',
  blue: 'from-blue-900 to-blue-600',
  purple: 'from-purple-900 to-purple-600',
  mixed: 'from-gray-900 via-blue-900 to-purple-800',
}

// Subtle bg hue for the section
const BG_HUES: Record<ProductColor, string> = {
  black: 'bg-gray-950/30',
  blue: 'bg-blue-950/30',
  purple: 'bg-purple-950/30',
  mixed: 'bg-purple-950/20',
}

export default function ProductHero() {
  const t = useTranslations('hero')
  const selectedColor = useStore((s) => s.selectedColor)
  const currency = useStore((s) => s.currency)

  useEffect(() => {
    trackViewProduct(selectedColor, currency, B2C_PRICE_USD)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleCTA() {
    // Scroll to buy section
    const buySection = document.getElementById('buy-now')
    if (buySection) {
      buySection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      id="hero"
      className={`relative min-h-[100svh] flex items-center pt-16 transition-colors duration-700 ${BG_HUES[selectedColor]}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 py-12 md:py-20">
          {/* Product image — LCP element, priority */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            className="w-full md:w-1/2 flex justify-center"
          >
            <div className="relative w-80 h-80 md:w-[420px] md:h-[420px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedColor}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${COLOR_GRADIENTS[selectedColor]} flex items-center justify-center`}
                >
                  {/* Placeholder until real product images are provided */}
                  <div className="text-center space-y-2 opacity-60">
                    <div className="tracking-[0.3em] text-2xl font-syne font-bold text-white uppercase">
                      S L I D E R
                    </div>
                    <p className="text-white/60 text-sm font-outfit capitalize">
                      {selectedColor} kit
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full md:w-1/2 space-y-6"
          >
            {/* Shipping badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600/15 border border-purple-600/30 text-purple-300 text-sm font-outfit">
              🚚 {t('badge_shipping_il')}
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl font-syne font-bold leading-tight">
              <span className="text-white">The Original </span>
              <span className="text-purple-400">All-in-One</span>
              <br />
              <span className="text-white">Cone Kit</span>
            </h1>

            <p className="text-gray-400 font-outfit text-lg">{t('sub')}</p>

            {/* Color selector */}
            <div className="space-y-2">
              <p className="text-sm font-outfit text-gray-400">{t('color_label')}</p>
              <ColorSwatch />
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: '🛡️', text: t('badge_patent') },
                { icon: '⭐', text: t('badge_customers') },
                { icon: '🌍', text: t('badge_shipping_intl') },
              ].map(({ icon, text }) => (
                <span
                  key={text}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-outfit"
                >
                  {icon} {text}
                </span>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={handleCTA}
              className="btn-purple text-base px-8 py-4 text-lg"
            >
              {t('cta')}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Bottom edge marker for StickyCartBar IntersectionObserver */}
      <div id="hero-bottom" className="absolute bottom-0 left-0 w-px h-px" />
    </section>
  )
}
