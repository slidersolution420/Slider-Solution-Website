'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useStore } from '@/store'
import { checkWholesaleSession } from '@/lib/auth'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/currency'
import NavBar from '@/components/ui/NavBar'
import Footer from '@/components/ui/Footer'
import type { Order } from '@/lib/types'

const PAGE_SIZE = 10

type OrderRow = Pick<
  Order,
  | 'id'
  | 'created_at'
  | 'items'
  | 'total_usd'
  | 'status'
  | 'tapuz_tracking_number'
  | 'hype_payment_id'
>

export default function WholesaleDashboard() {
  const t = useTranslations('wholesale')
  const locale = useLocale()
  const router = useRouter()
  const currency = useStore((s) => s.currency)

  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    checkWholesaleSession().then((account) => {
      if (!account) {
        router.replace(`/${locale}`)
        return
      }
      loadOrders(account.email ?? '')
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadOrders(email: string) {
    const supabase = createClient()
    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, count } = await supabase
      .from('orders')
      .select('id, created_at, items, total_usd, status, tapuz_tracking_number, hype_payment_id', {
        count: 'exact',
      })
      .eq('type', 'b2b')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .range(from, to)

    setOrders((data ?? []) as OrderRow[])
    setTotal(count ?? 0)
    setLoading(false)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080F] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#07080F]">
      <NavBar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <h1 className="text-3xl font-syne font-bold text-white mb-8">
          {t('dashboard.title')}
        </h1>

        {orders.length === 0 ? (
          <div className="card-surface p-12 text-center">
            <p className="text-gray-400 font-outfit">
              <a
                href={`/${locale}`}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                {t('dashboard.empty')}
              </a>
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="card-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-outfit">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-4 py-3 text-right text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Tracking
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const date = new Date(order.created_at).toLocaleDateString(
                        locale,
                        { year: 'numeric', month: 'short', day: 'numeric' },
                      )
                      const shortId = order.id.slice(0, 8).toUpperCase()
                      const itemCount = Array.isArray(order.items)
                        ? (order.items as unknown[]).reduce(
                            (sum: number, i: unknown) =>
                              sum + ((i as { qty?: number }).qty ?? 0),
                            0,
                          )
                        : 0

                      return (
                        <tr
                          key={order.id}
                          className="border-b border-white/5 hover:bg-white/2 transition-colors"
                        >
                          <td className="px-4 py-3.5 text-gray-300">{date}</td>
                          <td className="px-4 py-3.5 text-gray-400 font-mono text-xs">
                            #{shortId}
                          </td>
                          <td className="px-4 py-3.5 text-gray-300">
                            {itemCount} kits
                          </td>
                          <td className="px-4 py-3.5 text-right text-white font-semibold">
                            {formatPrice(order.total_usd, currency)}
                          </td>
                          <td className="px-4 py-3.5">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="px-4 py-3.5">
                            {order.tapuz_tracking_number &&
                            !order.tapuz_tracking_number.startsWith('MOCK-') ? (
                              <a
                                href={`https://crm.tapuzdelivery.co.il/baldar/deliverystatus.aspx?DeliveryNumber=${order.tapuz_tracking_number}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300 transition-colors text-xs"
                              >
                                {t('dashboard.tracking')} →
                              </a>
                            ) : (
                              <span className="text-gray-600 text-xs">
                                {t('dashboard.pending')}
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500 font-outfit">
                  Page {page + 1} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 rounded-lg border border-white/10 text-sm font-outfit text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={page >= totalPages - 1}
                    className="px-4 py-2 rounded-lg border border-white/10 text-sm font-outfit text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

function StatusBadge({ status }: { status: Order['status'] }) {
  const styles: Partial<Record<Order['status'], string>> = {
    paid: 'bg-green-500/10 text-green-400 border-green-500/20',
    shipped: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    delivered: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
    refunded: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-outfit font-medium capitalize ${styles[status] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}
    >
      {status}
    </span>
  )
}
