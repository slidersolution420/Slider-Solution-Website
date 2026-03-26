'use client'

import { useTranslations } from 'next-intl'
import { useStore } from '@/store'
import { formatPrice, B2C_PRICE_USD } from '@/lib/currency'

export default function StickyCartBar() {
  const t = useTranslations('hero')
  const { addItem, openCart, selectedColor, selectedQty, currency } = useStore()

  function handleAdd() {
    addItem({
      productId: 'slider-cone-kit',
      color: selectedColor,
      quantity: selectedQty,
      priceUsd: B2C_PRICE_USD,
      name: `SLIDER — ${selectedColor}`,
    })
    openCart()
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-gray-950/95 p-4 backdrop-blur-sm md:hidden">
      <button
        onClick={handleAdd}
        className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 py-3.5 text-base font-bold text-white"
      >
        {t('add_to_cart')} — {formatPrice(B2C_PRICE_USD * selectedQty, currency)}
      </button>
    </div>
  )
}
