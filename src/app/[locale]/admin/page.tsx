import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase-server'
import { getConfig } from '@/lib/config'
import type { WholesaleAccount, Review, Order } from '@/lib/types'
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
  const [{ data: accounts, error }, config, { data: reviews }, { data: orders }] = await Promise.all([
    supabase.from('wholesale_accounts').select('*').order('created_at', { ascending: false }),
    getConfig(),
    supabase.from('reviews').select('*').order('created_at', { ascending: false }),
    supabase
      .from('orders')
      .select('id, email, name, total_usd, status, created_at, country')
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950">
        <p className="text-red-400">שגיאה בטעינה: {error.message}</p>
      </main>
    )
  }

  return (
    <AdminDashboard
      accounts={(accounts ?? []) as WholesaleAccount[]}
      config={config}
      secret={session}
      reviews={(reviews ?? []) as Review[]}
      orders={(orders ?? []) as Pick<Order, 'id' | 'email' | 'name' | 'total_usd' | 'status' | 'created_at' | 'country'>[]}
    />
  )
}
