'use client'

import { useTranslations } from 'next-intl'
import { useStore } from '@/store'
import { formatPrice, B2B_BOX_PRICE_USD } from '@/lib/currency'

export default function BuyNowB2B() {
  const t = useTranslations('buy')
  const currency = useStore((s) => s.currency)

  return (
    <div className="card-surface p-8 space-y-4 max-w-lg mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xl font-syne font-bold text-white">
            Display Package — 6 Kits
          </h3>
          <p className="text-gray-400 font-outfit text-sm">
            {t('b2b_composition')}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-gray-700/60 text-gray-400 text-xs font-outfit whitespace-nowrap">
          {t('b2b_wave4')}
        </span>
      </div>

      <div className="text-3xl font-syne font-bold text-white">
        {formatPrice(B2B_BOX_PRICE_USD, currency)}
        <span className="text-base text-gray-500 font-outfit font-normal ml-2">
          / box
        </span>
      </div>

      <button
        disabled
        className="w-full py-3 rounded-full bg-purple-600/30 text-purple-400/60 font-outfit font-semibold text-base cursor-not-allowed"
      >
        {t('b2b_cta')}
      </button>
    </div>
  )
}
