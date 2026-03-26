import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase-server'
import { getConfig } from '@/lib/config'
import type { WholesaleAccount } from '@/lib/types'
import AdminDashboard from './AdminDashboard'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Admin — SLIDER',
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const jar = await cookies()
  const session = jar.get('admin_auth')?.value

  if (!session || session !== process.env.CRON_SECRET) {
    return <LoginForm />
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
      secret={session}
    />
  )
}
