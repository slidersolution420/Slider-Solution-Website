'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { WholesaleAccount, WholesaleAccountStatus } from '@/lib/types'

interface AdminDashboardProps {
  accounts: WholesaleAccount[]
  secret: string
}

const STATUS_LABELS: Record<WholesaleAccountStatus, string> = {
  pending: 'Pending',
  active: 'Active',
  blocked: 'Blocked',
}

const STATUS_COLORS: Record<WholesaleAccountStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  active: 'bg-green-500/20 text-green-300 border-green-500/30',
  blocked: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function AdminDashboard({ accounts, secret }: AdminDashboardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function updateStatus(id: string, status: WholesaleAccountStatus) {
    setLoadingId(id)
    setError(null)
    try {
      const res = await fetch('/api/admin/wholesale', {
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

  const pending = accounts.filter((a) => a.status === 'pending')
  const others = accounts.filter((a) => a.status !== 'pending')

  return (
    <div className="min-h-screen bg-gray-950 p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Wholesale Admin</h1>
          <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-sm text-yellow-300 border border-yellow-500/30">
            {pending.length} pending
          </span>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/30 p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {accounts.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No wholesale accounts yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  {['Business', 'Contact', 'Phone', 'Username', 'Country', 'Status', 'Signed up', 'Actions'].map(
                    (h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[...pending, ...others].map((account) => (
                  <tr
                    key={account.id}
                    className={`transition-colors hover:bg-white/5 ${account.status === 'pending' ? 'bg-yellow-500/5' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium">{account.business_name}</td>
                    <td className="px-4 py-3 text-gray-300">{account.contact_name}</td>
                    <td className="px-4 py-3 text-gray-400">{account.phone}</td>
                    <td className="px-4 py-3 text-gray-400">@{account.username}</td>
                    <td className="px-4 py-3 text-gray-400">{account.country}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[account.status]}`}>
                        {STATUS_LABELS[account.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {new Date(account.created_at).toLocaleDateString('en-IL')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {account.status !== 'active' && (
                          <button
                            onClick={() => updateStatus(account.id, 'active')}
                            disabled={isPending || loadingId === account.id}
                            className="rounded bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {account.status !== 'blocked' && (
                          <button
                            onClick={() => updateStatus(account.id, 'blocked')}
                            disabled={isPending || loadingId === account.id}
                            className="rounded bg-red-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                          >
                            Block
                          </button>
                        )}
                        {account.status !== 'pending' && (
                          <button
                            onClick={() => updateStatus(account.id, 'pending')}
                            disabled={isPending || loadingId === account.id}
                            className="rounded bg-white/10 px-2.5 py-1 text-xs font-medium text-gray-300 hover:bg-white/20 disabled:opacity-50 transition-colors"
                          >
                            Revert
                          </button>
                        )}
                        {loadingId === account.id && (
                          <span className="text-gray-500 text-xs">Saving…</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
