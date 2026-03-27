import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase-server'
import type { Order, WholesaleAccount } from '@/lib/types'
import AdminDashboard from './AdminDashboard'
import OrdersDashboard from './OrdersDashboard'

export const metadata: Metadata = {
  title: 'Admin — SLIDER',
  robots: { index: false, follow: false },
}

interface AdminPageProps {
  searchParams: Promise<{ secret?: string; tab?: string }>
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { secret, tab } = await searchParams

  if (!secret || secret !== process.env.CRON_SECRET) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950">
        <p className="text-red-400">Access denied.</p>
      </main>
    )
  }

  const supabase = createServiceClient()

  const [{ data: accountsData, error: accountsError }, { data: ordersData, error: ordersError }] =
    await Promise.all([
      supabase
        .from('wholesale_accounts')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200),
    ])

  if (accountsError || ordersError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950">
        <p className="text-red-400">
          Failed to load: {accountsError?.message ?? ordersError?.message}
        </p>
      </main>
    )
  }

  const activeTab = tab === 'wholesale' ? 'wholesale' : 'orders'
  const pendingCount = (accountsData ?? []).filter((a) => a.status === 'pending').length

  return (
    <main className="min-h-screen bg-gray-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          {pendingCount > 0 && (
            <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-sm text-yellow-300 border border-yellow-500/30">
              {pendingCount} wholesale pending
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-white/10">
          <a
            href={`?secret=${secret}&tab=orders`}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'orders'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            הזמנות ({(ordersData ?? []).length})
          </a>
          <a
            href={`?secret=${secret}&tab=wholesale`}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'wholesale'
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            סיטונאים ({(accountsData ?? []).length})
          </a>
        </div>

        {activeTab === 'orders' && (
          <OrdersDashboard
            orders={(ordersData ?? []) as Order[]}
            secret={secret}
          />
        )}

        {activeTab === 'wholesale' && (
          <AdminDashboard
            accounts={(accountsData ?? []) as WholesaleAccount[]}
            secret={secret}
          />
        )}
      </div>
    </main>
  )
}
