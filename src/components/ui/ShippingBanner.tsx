'use client'

import { useTranslations } from 'next-intl'
import { TruckIcon } from '@heroicons/react/24/solid'

export default function ShippingBanner() {
  const t = useTranslations('hero')

  return (
    <div className="fixed inset-x-0 top-[60px] z-40 overflow-hidden border-b border-green-700/30 bg-green-950/90 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-6 py-1.5 text-center text-xs font-semibold text-green-400">
        <TruckIcon className="size-3.5 shrink-0" />
        <span className="min-w-0 break-words">{t('shipping_pill')}</span>
      </div>
    </div>
  )
}
