import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase-server'
import { getConfig } from '@/lib/config'
import type { WholesaleAccount } from '@/lib/types'
import AdminDashboard from './AdminDashboard'

export const metadata: Metadata = {
  title: 'Admin — SLIDER',
  robots: { index: false, follow: false },
}

interface AdminPageProps {
  searchParams: Promise<{ secret?: string }>
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { secret } = await searchParams

  if (!secret || secret !== process.env.CRON_SECRET) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950">
        <p className="text-red-400">Access denied.</p>
      </main>
    )
  }

  const supabase = createServiceClient()
  const [{ data, error }, config] = await Promise.all([
    supabase.from('wholesale_accounts').select('*').order('created_at', { ascending: false }),
    getConfig(),
  ])

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950">
        <p className="text-red-400">Failed to load: {error.message}</p>
      </main>
    )
  }

  return (
    <AdminDashboard
      accounts={(data ?? []) as WholesaleAccount[]}
      config={config}
      secret={secret}
    />
  )
}
