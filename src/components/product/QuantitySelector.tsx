'use client'

import { useTranslations } from 'next-intl'
import { useStore } from '@/store'
import { getShippingMessage } from '@/lib/shipping'
import { formatPrice } from '@/lib/currency'

const QUANTITIES = [1, 2, 3] as const

export default function QuantitySelector() {
  const t = useTranslations('qty')
  const selectedQty = useStore((s) => s.selectedQty)
  const setSelectedQty = useStore((s) => s.setSelectedQty)
  const selectedCountry = useStore((s) => s.selectedCountry)
  const currency = useStore((s) => s.currency)

  const isNonIL = selectedCountry !== 'IL' && selectedCountry !== ''
  const savingsText =
    isNonIL ? t('saves', { amount: formatPrice(25, currency) }) : null

  return (
    <div className="flex gap-2 w-full">
      {QUANTITIES.map((qty) => {
        const isSelected = selectedQty === qty
        const isPopular = qty === 3
        const shippingMsg = getShippingMessage(
          selectedCountry || 'IL',
          qty,
        )

        return (
          <button
            key={qty}
            onClick={() => setSelectedQty(qty)}
            aria-pressed={isSelected}
            className={`relative flex-1 flex flex-col items-start justify-center px-3 py-3 rounded-xl border transition-all duration-200 text-left ${
              isSelected
                ? 'border-purple-500 scale-[1.02] bg-purple-600/10'
                : isPopular
                  ? 'border-purple-600 shadow-[0_0_16px_rgba(124,58,237,0.3)] bg-purple-600/5'
                  : 'border-gray-700 opacity-70 hover:opacity-90 hover:border-gray-500'
            }`}
          >
            {/* Most Popular badge */}
            {isPopular && (
              <span className="absolute -top-2.5 right-2 px-2 py-0.5 bg-purple-600 text-white text-[10px] font-outfit font-medium rounded-full">
                {t('most_popular')}
              </span>
            )}

            {/* Qty label */}
            <span className="font-outfit font-semibold text-sm text-white">
              {qty === 1 ? t('kit_1') : qty === 2 ? t('kit_2') : t('kit_3')}
            </span>

            {/* Shipping sub-line */}
            <span className="text-[11px] font-outfit text-gray-400 mt-0.5 leading-tight">
              {shippingMsg}
            </span>

            {/* Savings for card 3, non-IL */}
            {isPopular && savingsText && (
              <span className="text-[10px] font-outfit text-purple-400 mt-0.5">
                {savingsText}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
