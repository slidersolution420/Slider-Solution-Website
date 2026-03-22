'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useStore } from '@/store'
import { formatPrice, B2C_PRICE_USD } from '@/lib/currency'
import { getShippingMessage } from '@/lib/shipping'
import { trackViewProduct, trackAddToCart } from '@/lib/analytics'
import QuantitySelector from './QuantitySelector'
import ColorSwatch from './ColorSwatch'
import TrustBar from '@/components/ui/TrustBar'
import BuyNowB2B from '@/components/wholesale/BuyNowB2B'

function getIsraelHour(): number {
  const now = new Date()
  const israelTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }),
  )
  return israelTime.getHours()
}

export default function BuyNowSection() {
  const t = useTranslations('buy')
  const selectedColor = useStore((s) => s.selectedColor)
  const selectedQty = useStore((s) => s.selectedQty)
  const selectedCountry = useStore((s) => s.selectedCountry)
  const currency = useStore((s) => s.currency)
  const isWholesaleUser = useStore((s) => s.isWholesaleUser)
  const addToCart = useStore((s) => s.addToCart)
  const openModal = useStore((s) => s.openModal)

  useEffect(() => {
    trackViewProduct({ color: selectedColor, currency })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cutoff = parseInt(
    process.env.NEXT_PUBLIC_SHIPPING_CUTOFF_HOUR ?? '16',
    10,
  )
  const israelHour = getIsraelHour()
  const shipsToday = israelHour < cutoff

  const shippingMsg = getShippingMessage(selectedCountry || 'IL', selectedQty)

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

  if (isWholesaleUser) {
    return (
      <section id="buy-now" className="py-20 bg-[#07080F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <BuyNowB2B />
        </div>
      </section>
    )
  }

  return (
    <section id="buy-now" className="py-20 bg-[#07080F]">
      <div className="max-w-lg mx-auto px-4 sm:px-6 space-y-6">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-syne font-bold text-white">
            {t('title')}
          </h2>
        </div>

        {/* Qty selector */}
        <QuantitySelector />

        {/* Color + Price row */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-outfit text-gray-400">{t('color_label')}</p>
            <ColorSwatch />
          </div>
          <div className="text-right">
            <p className="text-3xl font-syne font-bold text-white">
              {formatPrice(B2C_PRICE_USD, currency)}
            </p>
            <p className="text-xs font-outfit text-gray-400 mt-0.5">
              {shippingMsg}
            </p>
          </div>
        </div>

        {/* Urgency row */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-outfit text-green-400">
            {shipsToday ? t('urgency_today') : t('urgency_tomorrow')}
          </span>
          <span className="text-sm font-outfit text-orange-400">
            {t('urgency_stock')}
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={handleAddToCart}
          className="btn-purple w-full text-lg py-4"
        >
          {t('add_to_cart')}
        </button>

        {/* Trust bar */}
        <TrustBar className="mt-2" />
      </div>
    </section>
  )
}
