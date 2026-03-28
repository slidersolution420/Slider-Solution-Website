'use client'

import { useTranslations } from 'next-intl'
import { signOutWholesale } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import type { WholesaleAccount, Order } from '@/lib/types'
import { formatPrice } from '@/lib/currency'
import { useStore } from '@/store'

interface WholesaleDashboardProps {
  account: WholesaleAccount
  orders: Order[]
  locale: string
  priceB2bUsd: number
}

export default function WholesaleDashboard({ account, orders, locale, priceB2bUsd }: WholesaleDashboardProps) {
  const t = useTranslations('wholesale')
  const { currency } = useStore()
  const router = useRouter()

  async function handleLogout() {
    await signOutWholesale()
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-surface pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{account.business_name}</h1>
            <p className="text-sm text-gray-500">{account.contact_name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            {t('logout')}
          </button>
        </div>

        {/* B2B buy section */}
        <div className="mb-8 rounded-2xl border border-brand-700/40 bg-brand-900/20 p-6">
          <h2 className="mb-2 font-semibold text-white">
            {locale === 'he' ? 'הזמן קופסת תצוגה' : 'Order Display Box'}
          </h2>
          <p className="mb-4 text-sm text-gray-400">
            {locale === 'he' ? '6 קיטים לקופסה' : '6 kits per box'} —{' '}
            <span className="font-bold text-brand-300">
              {formatPrice(priceB2bUsd, currency)}
            </span>
          </p>
          <Link
            href="/checkout"
            className="inline-block rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
          >
            {locale === 'he' ? 'הזמן עכשיו' : 'Order Now'}
          </Link>
        </div>

        {/* Orders */}
        <h2 className="mb-4 font-semibold text-white">{t('dashboard_title')}</h2>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-8 text-center text-gray-500">
            {t('no_orders')}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-gray-900/80">
                <tr>
                  {['#', locale === 'he' ? 'תאריך' : 'Date', locale === 'he' ? 'סה"כ' : 'Total', locale === 'he' ? 'סטטוס' : 'Status'].map(
                    (h) => (
                      <th key={h} className="px-4 py-3 text-start text-xs font-medium text-gray-500">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      {order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(order.created_at).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US')}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">
                      ${order.total_usd.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          order.status === 'delivered'
                            ? 'bg-green-950 text-green-400'
                            : order.status === 'shipped'
                              ? 'bg-blue-950 text-blue-400'
                              : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
