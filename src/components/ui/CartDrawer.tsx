'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useStore } from '@/store'
import { Link } from '@/i18n/navigation'
import { formatPrice } from '@/lib/currency'
import { getShippingCost } from '@/lib/shipping'
import { XMarkIcon, TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'

export default function CartDrawer() {
  const t = useTranslations('cart')
  const { items, cartOpen, closeCart, removeItem, currency, totalUsd, selectedCountry } = useStore()
  const closeRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname() // raw pathname incl. locale prefix (/en vs /) — changes on locale switch

  // Close cart on any navigation (pathname from next/navigation includes locale prefix)
  useEffect(() => {
    closeCart()
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Focus close button on open
  useEffect(() => {
    if (cartOpen) {
      closeRef.current?.focus()
    }
  }, [cartOpen])

  // Trap scroll when open
  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [cartOpen])

  const subtotalUsd = totalUsd()
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0)
  const shippingUsd = getShippingCost(selectedCountry, totalQty)
  const grandTotalUsd = subtotalUsd + shippingUsd

  return (
    <>
      {/* Backdrop */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('title')}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-gray-950 shadow-2xl transition-transform duration-300 ease-in-out ${
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-base font-semibold text-white">{t('title')}</h2>
          <button
            ref={closeRef}
            onClick={closeCart}
            className="flex size-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white"
            aria-label="Close cart"
          >
            <XMarkIcon className="size-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <ShoppingBagIcon className="mb-3 size-12 opacity-30" />
              <p>{t('empty')}</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.color}`}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-gray-900/50 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-gray-500">× {item.quantity}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-white">
                    {formatPrice(item.priceUsd * item.quantity, currency)}
                  </p>
                  <button
                    onClick={() => removeItem(item.productId, item.color)}
                    className="shrink-0 rounded-lg p-1.5 text-gray-500 hover:bg-white/10 hover:text-white"
                    aria-label={t('remove')}
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/10 px-5 py-4">
            <div className="mb-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>{t('subtotal')}</span>
                <span>{formatPrice(subtotalUsd, currency)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>{t('shipping')}</span>
                <span>
                  {shippingUsd === 0 ? (
                    <span className="text-green-400">{t('shipping_free')}</span>
                  ) : (
                    formatPrice(shippingUsd, currency)
                  )}
                </span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 font-semibold text-white">
                <span>{t('total')}</span>
                <span>{formatPrice(grandTotalUsd, currency)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 py-3.5 text-center text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              {t('checkout')}
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
