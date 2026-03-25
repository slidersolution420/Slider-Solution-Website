'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useStore } from '@/store'
import { formatPrice, B2B_BOX_PRICE_USD } from '@/lib/currency'
import { getShippingMessage } from '@/lib/shipping'
import { trackAddToCart } from '@/lib/analytics'
import { signOutWholesale } from '@/lib/auth'

const COLOR_BADGES = [
  { color: 'black', dot: 'bg-[#0F0F0F] border border-gray-600', label: '2× Black' },
  { color: 'blue', dot: 'bg-[#1D4ED8]', label: '2× Blue' },
  { color: 'purple', dot: 'bg-[#7C3AED]', label: '2× Purple' },
] as const

export default function BuyNowB2B() {
  const t = useTranslations('wholesale')
  const currency = useStore((s) => s.currency)
  const selectedCountry = useStore((s) => s.selectedCountry)
  const addToCart = useStore((s) => s.addToCart)
  const openModal = useStore((s) => s.openModal)
  const setIsWholesaleUser = useStore((s) => s.setIsWholesaleUser)

  const [qty, setQty] = useState(1)

  const totalKits = qty * 6
  const pricePerKit = B2B_BOX_PRICE_USD / 6
  const shippingMsg = getShippingMessage(selectedCountry || 'IL', totalKits)

  function handleAddToCart() {
    const id = `b2b-mixed-${Date.now()}`
    addToCart({
      productId: id,
      color: 'mixed',
      qty: totalKits,
      priceUsd: pricePerKit,
      type: 'b2b',
    })
    openModal('cart')
    trackAddToCart('black', totalKits, 'b2b')
  }

  async function handleLogout() {
    await signOutWholesale()
    setIsWholesaleUser(false)
  }

  return (
    <div className="card-surface p-8 space-y-6 max-w-lg mx-auto">
      {/* Heading */}
      <div>
        <h3 className="text-2xl font-syne font-bold text-white">
          {t('product.title')}
        </h3>
        <p className="text-gray-400 font-outfit text-sm mt-1">
          {t('product.contents')}
        </p>
      </div>

      {/* Color badges */}
      <div className="flex gap-3 flex-wrap">
        {COLOR_BADGES.map(({ color, dot, label }) => (
          <span
            key={color}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 font-outfit text-xs"
          >
            <span className={`w-3 h-3 rounded-full shrink-0 ${dot}`} />
            {label}
          </span>
        ))}
      </div>

      {/* Price */}
      <div>
        <p className="text-3xl font-syne font-bold text-white">
          {formatPrice(B2B_BOX_PRICE_USD * qty, currency)}
        </p>
        <p className="text-xs font-outfit text-gray-500 mt-0.5">
          {formatPrice(B2B_BOX_PRICE_USD, currency)} {t('product.perBox')}
        </p>
        <p className="text-xs font-outfit text-green-400 mt-1">{shippingMsg}</p>
      </div>

      {/* Quantity stepper */}
      <div>
        <p className="text-xs font-outfit text-gray-400 mb-2">
          {t('product.qtyLabel')}
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="w-9 h-9 rounded-full border border-white/15 text-white font-bold text-lg flex items-center justify-center hover:border-purple-500 hover:text-purple-400 transition-colors"
          >
            −
          </button>
          <span className="text-xl font-syne font-bold text-white w-8 text-center">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            aria-label="Increase quantity"
            className="w-9 h-9 rounded-full border border-white/15 text-white font-bold text-lg flex items-center justify-center hover:border-purple-500 hover:text-purple-400 transition-colors"
          >
            +
          </button>
          <span className="text-xs text-gray-500 font-outfit">
            = {totalKits} kits
          </span>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleAddToCart}
        className="btn-purple w-full text-base py-4"
      >
        {t('cta')}
      </button>

      {/* Logout */}
      <button
        onClick={() => { void handleLogout() }}
        className="w-full text-center text-xs font-outfit text-gray-600 hover:text-gray-400 transition-colors"
      >
        {t('logout')}
      </button>
    </div>
  )
}
