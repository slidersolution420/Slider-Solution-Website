'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useStore } from '@/store'
import { formatPrice } from '@/lib/currency'
import { getShippingCost, getShippingMessage } from '@/lib/shipping'
import { trackBeginCheckout } from '@/lib/analytics'
import TrustBar from '@/components/ui/TrustBar'
import type { ProductColor } from '@/lib/types'

const COLOR_DOTS: Record<ProductColor, string> = {
  black: 'bg-[#0F0F0F] border border-gray-600',
  blue: 'bg-[#1D4ED8]',
  purple: 'bg-[#7C3AED]',
  mixed: 'bg-gradient-to-br from-[#0F0F0F] via-[#1D4ED8] to-[#7C3AED]',
}

const COLOR_NAMES: Record<ProductColor, string> = {
  black: 'Black Kit',
  blue: 'Blue Kit',
  purple: 'Purple Kit',
  mixed: 'Display Package',
}

export default function CartDrawer() {
  const t = useTranslations('cart')
  const locale = useLocale()
  const router = useRouter()
  const cart = useStore((s) => s.cart)
  const currency = useStore((s) => s.currency)
  const selectedCountry = useStore((s) => s.selectedCountry)
  const modals = useStore((s) => s.modals)
  const closeModal = useStore((s) => s.closeModal)
  const removeFromCart = useStore((s) => s.removeFromCart)

  const isOpen = modals.cart
  const hasCountry = selectedCountry !== ''

  // Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal('cart')
    }
    if (isOpen) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeModal])

  const subtotalUsd = cart.reduce(
    (sum, item) => sum + item.priceUsd * item.qty,
    0,
  )
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0)

  // Only calc shipping if country is known; default to IL for display
  const effectiveCountry = hasCountry ? selectedCountry : 'IL'
  const shippingUsd = getShippingCost(effectiveCountry, totalQty, 'USD')
  const shippingMsg = hasCountry
    ? getShippingMessage(effectiveCountry, totalQty)
    : t('shipping_unknown')
  const totalUsd = subtotalUsd + shippingUsd

  function handleCheckout() {
    trackBeginCheckout({
      items: cart,
      totalUsd,
      currency,
      shippingCountry: effectiveCountry,
    })
    closeModal('cart')
    router.push(`/${locale}/checkout`)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeModal('cart')}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#0F1629] border-l border-white/5 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="font-syne font-bold text-lg text-white">
                {t('title')}
              </h2>
              <button
                onClick={() => closeModal('cart')}
                aria-label="Close cart"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="flex items-center justify-center h-40">
                  <p className="text-gray-500 font-outfit text-sm">
                    {t('empty')}
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.color}`}
                    className="flex items-center gap-3 py-3 border-b border-white/5"
                  >
                    {/* Color dot */}
                    <div
                      className={`w-8 h-8 rounded-full shrink-0 ${COLOR_DOTS[item.color]}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-outfit text-white truncate">
                        {COLOR_NAMES[item.color]}
                      </p>
                      <p className="text-xs font-outfit text-gray-400">
                        Qty: {item.qty}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-outfit text-white">
                        {formatPrice(item.priceUsd * item.qty, currency)}
                      </p>
                      <button
                        onClick={() =>
                          removeFromCart(item.productId, item.color)
                        }
                        className="text-[11px] font-outfit text-gray-500 hover:text-red-400 transition-colors"
                      >
                        {t('remove')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="px-6 py-4 border-t border-white/5 space-y-3">
                {/* Shipping */}
                <div className="flex items-center justify-between text-sm font-outfit">
                  <span className="text-gray-400">{t('shipping')}</span>
                  <span className={`${!hasCountry ? 'text-gray-500 text-xs' : 'text-gray-300'}`}>
                    {!hasCountry
                      ? t('shipping_unknown')
                      : shippingUsd === 0
                        ? t('free')
                        : formatPrice(shippingUsd, currency)}
                  </span>
                </div>
                {hasCountry && (
                  <div className="text-xs font-outfit text-gray-500 -mt-2">
                    {shippingMsg}
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between font-syne font-bold">
                  <span className="text-white">{t('total')}</span>
                  <span className="text-white text-lg">
                    {formatPrice(hasCountry ? totalUsd : subtotalUsd, currency)}
                  </span>
                </div>

                {/* Trust bar */}
                <TrustBar className="py-2" />

                {/* CTA */}
                <button
                  onClick={handleCheckout}
                  className="btn-purple w-full text-base py-3.5"
                >
                  {t('checkout')}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
