'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Order, OrderStatus } from '@/lib/types'

interface OrdersDashboardProps {
  orders: Order[]
  secret: string
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  paid: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  shipped: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  delivered: 'bg-green-500/20 text-green-300 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  refunded: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
}

const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending: ['paid', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['delivered', 'refunded'],
  delivered: ['refunded'],
}

export default function OrdersDashboard({ orders, secret }: OrdersDashboardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function updateStatus(id: string, status: OrderStatus) {
    setLoadingId(id)
    setError(null)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Update failed')
      }
      startTransition(() => {
        router.refresh()
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Orders</h2>
        <span className="rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-300 border border-blue-500/30">
          {orders.length} total
        </span>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/30 p-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                {[
                  'Order ID',
                  'Date',
                  'Customer',
                  'Shipping',
                  'Items',
                  'Total ₪',
                  'Status',
                  'Payment ID',
                  'Tapuz',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => {
                const addr = order.shipping_address
                const totalIls = Math.round(order.total_usd * 3.7)
                const nextStatuses = NEXT_STATUSES[order.status] ?? []

                return (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-white/5"
                  >
                    {/* Order ID */}
                    <td className="px-3 py-3">
                      <span className="font-mono text-xs text-white">
                        {order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-3 py-3 text-gray-400 whitespace-nowrap">
                      <div>{new Date(order.created_at).toLocaleDateString('he-IL')}</div>
                      <div className="text-xs text-gray-600">
                        {new Date(order.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-3 py-3">
                      <div className="font-medium text-white">{order.name}</div>
                      <div className="text-xs text-gray-400">{order.email}</div>
                      <div className="text-xs text-gray-500">{addr.phone}</div>
                    </td>

                    {/* Shipping */}
                    <td className="px-3 py-3 text-gray-400">
                      <div>{addr.address}</div>
                      <div className="text-xs text-gray-500">{addr.city}</div>
                    </td>

                    {/* Items */}
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-0.5">
                        {order.items.map((item, i) => (
                          <span key={i} className="text-xs text-gray-300 whitespace-nowrap">
                            {item.color ?? item.name ?? '—'} × {item.quantity ?? 1}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="px-3 py-3 font-medium text-white whitespace-nowrap">
                      ₪{totalIls}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}
                      >
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>

                    {/* Payment ID */}
                    <td className="px-3 py-3">
                      <span className="font-mono text-xs text-gray-500">
                        {order.hype_payment_id ?? '—'}
                      </span>
                    </td>

                    {/* Tapuz */}
                    <td className="px-3 py-3">
                      {order.delivery_number ? (
                        <div>
                          <a
                            href="https://crm.tapuzdelivery.co.il/baldar/deliverystatus.aspx"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-cyan-400 hover:text-cyan-300 underline"
                          >
                            {order.delivery_number}
                          </a>
                          {order.tapuz_branch && (
                            <div className="text-xs text-gray-600">
                              {order.tapuz_branch}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span className="text-xs text-red-400">לא נשלח עדיין</span>
                          {order.tapuz_error && (
                            <div className="text-xs text-red-600 mt-0.5 max-w-[140px] truncate" title={order.tapuz_error}>
                              {order.tapuz_error}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-1">
                        {nextStatuses.map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus(order.id, s)}
                            disabled={isPending || loadingId === order.id}
                            className={`rounded px-2 py-0.5 text-xs font-medium text-white disabled:opacity-50 transition-colors whitespace-nowrap ${
                              s === 'cancelled'
                                ? 'bg-red-700 hover:bg-red-600'
                                : s === 'shipped'
                                ? 'bg-cyan-700 hover:bg-cyan-600'
                                : s === 'delivered'
                                ? 'bg-green-700 hover:bg-green-600'
                                : 'bg-blue-700 hover:bg-blue-600'
                            }`}
                          >
                            → {STATUS_LABELS[s]}
                          </button>
                        ))}
                        {loadingId === order.id && (
                          <span className="text-gray-500 text-xs">Saving…</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
