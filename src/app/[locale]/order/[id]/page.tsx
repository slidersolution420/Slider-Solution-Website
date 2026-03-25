import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { createClient } from '@/lib/supabase-server'
import PurchaseTracker from './PurchaseTracker'
import type { Currency } from '@/lib/types'

interface Props {
  params: Promise<{ locale: string; id: string }>
}

export default async function OrderSuccessPage({ params }: Props) {
  const { locale, id } = await params
  const t = await getTranslations('success')

  // Fetch order from Supabase unless it's a mock
  let orderEmail = ''
  let totalUsd = 0
  let shippingCountry = 'IL'
  const currency: Currency = 'USD'

  if (!id.startsWith('mock-')) {
    try {
      const supabase = await createClient()
      const { data: order } = await supabase
        .from('orders')
        .select('email, total_usd, country, items')
        .eq('hype_payment_id', id)
        .single()

      if (order) {
        orderEmail = String(order.email ?? '')
        totalUsd = Number(order.total_usd ?? 0)
        shippingCountry = String(order.country ?? 'IL')
      }
    } catch {
      // DB unavailable — still render success page
    }
  }

  const shortRef = id.slice(0, 8).toUpperCase()

  return (
    <div className="min-h-screen bg-[#07080F] pt-20 pb-16 flex items-center justify-center px-4">
      {/* Side-effect client component — fires once */}
      <PurchaseTracker
        orderId={id}
        totalUsd={totalUsd}
        currency={currency}
        shippingCountry={shippingCountry}
      />

      <div className="max-w-lg w-full space-y-8 text-center">
        {/* Check icon */}
        <div className="flex justify-center">
          <CheckCircleIcon className="w-16 h-16 text-green-400" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-syne font-bold text-white">
            {t('title')}
          </h1>
          <p className="text-gray-400 font-outfit text-lg">{t('sub')}</p>
        </div>

        {/* Order card */}
        <div className="card-surface p-6 space-y-3 text-left">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-outfit text-sm">
              {t('order_ref')}
            </span>
            <span className="font-syne font-bold text-white text-sm">
              #{shortRef}
            </span>
          </div>

          {orderEmail && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-outfit text-sm">{t('email_label')}</span>
              <span className="text-gray-300 font-outfit text-sm truncate max-w-[200px]">
                {orderEmail}
              </span>
            </div>
          )}

          {totalUsd > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-outfit text-sm">{t('total_label')}</span>
              <span className="text-white font-syne font-bold">
                ${totalUsd.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Email note */}
        <p className="text-gray-500 font-outfit text-sm">{t('email')}</p>

        {/* Back link */}
        <Link
          href={`/${locale}`}
          className="inline-block text-purple-400 hover:text-purple-300 font-outfit text-sm transition-colors"
        >
          {t('back')}
        </Link>
      </div>
    </div>
  )
}
