'use client'

import { useTranslations } from 'next-intl'
import { TruckIcon, LockClosedIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface TrustBarProps {
  className?: string
}

export default function TrustBar({ className = '' }: TrustBarProps) {
  const t = useTranslations('trust')
  const showGuarantee = process.env.NEXT_PUBLIC_SHOW_GUARANTEE === 'true'

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-6 ${className}`}
    >
      {/* Shipping */}
      <div className="flex items-start gap-2">
        <TruckIcon className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-outfit text-gray-300">{t('shipping')}</p>
          <p className="text-[10px] font-outfit text-gray-500">{t('shipping_sub')}</p>
        </div>
      </div>

      {/* Secure */}
      <div className="flex items-start gap-2">
        <LockClosedIcon className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-outfit text-gray-300">{t('secure')}</p>
          <p className="text-[10px] font-outfit text-gray-500">{t('secure_sub')}</p>
        </div>
      </div>

      {/* Guarantee — only when SHOW_GUARANTEE=true */}
      {showGuarantee && (
        <div className="flex items-start gap-2">
          <ArrowPathIcon className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-outfit text-gray-300">{t('guarantee')}</p>
            <p className="text-[10px] font-outfit text-gray-500">{t('guarantee_sub')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
