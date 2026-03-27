'use client'

import { useTranslations } from 'next-intl'
import { TruckIcon } from '@heroicons/react/24/solid'

export default function ShippingBanner() {
  const t = useTranslations('hero')

  return (
    <div className="fixed inset-x-0 top-[60px] z-40 border-b border-green-700/30 bg-green-950/90 backdrop-blur-sm">
      <div className="flex items-center justify-center gap-2 py-1.5 text-xs font-semibold text-green-400">
        <TruckIcon className="size-3.5 shrink-0" />
        <span>{t('shipping_pill')}</span>
      </div>
    </div>
  )
}
