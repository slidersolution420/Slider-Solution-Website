'use client'

import { useTranslations } from 'next-intl'
import { useStore } from '@/store'
import { formatPrice } from '@/lib/currency'
import { calcPrice } from '@/lib/pricing'
import type { ProductContent } from '@/lib/keystatic'

interface StickyCartBarProps {
  product: ProductContent
  locale: string
  discountPct: number
  priceUsd: number
}

export default function StickyCartBar({ product, locale, discountPct, priceUsd }: StickyCartBarProps) {
  const t = useTranslations('hero')
  const { addItem, openCart, selectedColor, selectedQty, currency } = useStore()
  const colorData = (product.colors ?? []).find((c) => c.slug === selectedColor) ?? product.colors?.[0]

  function handleAdd() {
    if (!colorData) return
    addItem({
      productId: 'slider-cone-kit',
      color: selectedColor,
      quantity: selectedQty,
      priceUsd: priceUsd,
      name: `${product.name} — ${colorData.name_en}`,
      name_he: `${product.name} — ${colorData.name_he}`,
      name_en: `${product.name} — ${colorData.name_en}`,
    })
    openCart()
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-gray-950/95 p-4 backdrop-blur-sm md:hidden">
      <button
        onClick={handleAdd}
        className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 py-3.5 text-base font-bold text-white"
      >
        {t('add_to_cart')} — {formatPrice(calcPrice(priceUsd, discountPct).discountedUsd * selectedQty, currency)}
      </button>
    </div>
  )
}
