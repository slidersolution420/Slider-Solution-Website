import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { checkWholesaleSession } from '@/lib/auth-server'
import { createServiceClient } from '@/lib/supabase-server'
import type { Order } from '@/lib/types'
import { getConfig } from '@/lib/config'
import NavBar from '@/components/ui/NavBar'
import Footer from '@/components/ui/Footer'
import WholesaleDashboard from './WholesaleDashboard'
import WholesaleLanding from './WholesaleLanding'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Wholesale Portal — SLIDER',
}

interface WholesalePageProps {
  params: Promise<{ locale: string }>
}

export default async function WholesalePage({ params }: WholesalePageProps) {
  const { locale } = await params
  const tw = await getTranslations('wholesale')
  const td = await getTranslations('wholesale_dashboard')
  const account = await checkWholesaleSession()

  if (!account) {
    return (
      <>
        <NavBar />
        <WholesaleLanding locale={locale} />
        <Footer />
      </>
    )
  }

  if (account.status === 'blocked') {
    return (
      <>
        <NavBar />
        <main className="flex min-h-screen items-center justify-center bg-surface pt-16">
          <p className="text-red-400">
            {tw('blocked')}
          </p>
        </main>
        <Footer />
      </>
    )
  }

  if (account.status === 'pending') {
    return (
      <>
        <NavBar />
        <main className="flex min-h-screen items-center justify-center bg-surface pt-16">
          <div className="text-center">
            <p className="text-lg text-yellow-400">
              {td('pending_review')}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {td('pending_sub')}
            </p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Active account — show dashboard
  const cfg = await getConfig()
  const supabase = createServiceClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('email', account.user_id) // Using user_id as join key via auth
    .eq('type', 'b2b')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <>
      <NavBar />
      <WholesaleDashboard account={account} orders={(orders ?? []) as Order[]} locale={locale} priceB2bUsd={cfg.price_b2b_usd} />
      <Footer />
    </>
  )
}
