'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useStore } from '@/store'
import { formatPrice, B2C_PRICE_USD } from '@/lib/currency'
import { getShippingMessage } from '@/lib/shipping'
import { trackAddToCart } from '@/lib/analytics'
import type { ProductColor } from '@/lib/types'

const COLOR_DOTS: Record<ProductColor, string> = {
  black: 'bg-[#0F0F0F] border border-gray-600',
  blue: 'bg-[#1D4ED8]',
  purple: 'bg-[#7C3AED]',
  mixed: 'bg-gradient-to-br from-[#0F0F0F] via-[#1D4ED8] to-[#7C3AED]',
}

export default function StickyCartBar() {
  const t = useTranslations('sticky')
  const selectedColor = useStore((s) => s.selectedColor)
  const selectedQty = useStore((s) => s.selectedQty)
  const selectedCountry = useStore((s) => s.selectedCountry)
  const currency = useStore((s) => s.currency)
  const modals = useStore((s) => s.modals)
  const addToCart = useStore((s) => s.addToCart)
  const openModal = useStore((s) => s.openModal)
  const [heroGone, setHeroGone] = useState(false)

  // Observe the hero bottom edge
  useEffect(() => {
    const heroBottom = document.getElementById('hero-bottom')
    if (!heroBottom) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && !entry.isIntersecting) {
          setHeroGone(true)
        }
      },
      { threshold: 0 },
    )
    observer.observe(heroBottom)
    return () => observer.disconnect()
  }, [])

  function handleAddToCart() {
    const id = `b2c-${selectedColor}-${Date.now()}`
    addToCart({
      productId: id,
      color: selectedColor,
      qty: selectedQty,
      priceUsd: B2C_PRICE_USD,
      type: 'b2c',
    })
    openModal('cart')
    trackAddToCart({
      color: selectedColor,
      qty: selectedQty,
      priceUsd: B2C_PRICE_USD,
      currency,
      shippingCountry: selectedCountry || 'IL',
    })
  }

  const shippingLine = getShippingMessage(selectedCountry || 'IL', selectedQty)
  const visible = heroGone && !modals.cart

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="sticky-bar"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-4 border-t border-purple-900/30"
          style={{ backgroundColor: 'rgba(7,8,14,0.95)', backdropFilter: 'blur(12px)' }}
        >
          {/* Left: color + price + shipping */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full shrink-0 ${COLOR_DOTS[selectedColor]}`} />
            <div>
              <p className="font-syne font-bold text-white text-sm leading-none">
                {formatPrice(B2C_PRICE_USD, currency)}
              </p>
              <p className="text-[10px] font-outfit text-gray-500 mt-0.5">
                {shippingLine}
              </p>
            </div>
          </div>

          {/* Right: CTA */}
          <button
            onClick={handleAddToCart}
            className="btn-purple text-sm py-2 px-5"
            style={{ minWidth: '140px' }}
          >
            {t('add_to_cart')}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
