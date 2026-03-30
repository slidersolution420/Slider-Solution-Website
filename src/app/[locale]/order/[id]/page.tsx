import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createServiceClient } from '@/lib/supabase-server'
import NavBar from '@/components/ui/NavBar'
import Footer from '@/components/ui/Footer'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { Link } from '@/i18n/navigation'
import type { Order } from '@/lib/types'

export const revalidate = 60 // cache order pages for 60 s — status changes are infrequent

export const metadata: Metadata = {
  title: 'Order Confirmed — SLIDER',
}

interface OrderPageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { locale, id } = await params

  const supabase = createServiceClient()
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (!order) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'order_details' })
  const o = order as Order

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-surface pt-24 pb-16">
        <div className="mx-auto max-w-lg px-4 text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircleIcon className="size-16 text-green-400" />
          </div>

          <h1 className="mb-2 text-2xl font-bold text-white">
            {t('title')}
          </h1>
          <p className="mb-8 text-gray-400">
            {t('subtitle')}
          </p>

          <div className="rounded-2xl border border-white/10 bg-gray-900 p-6 text-start">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">{t('order_number')}</dt>
                <dd className="font-mono text-white">{o.id.slice(0, 8).toUpperCase()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">{t('total')}</dt>
                <dd className="font-semibold text-white">${o.total_usd.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">{t('status')}</dt>
                <dd className="capitalize text-green-400">{o.status}</dd>
              </div>
              {o.tapuz_tracking_number && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">{t('tracking')}</dt>
                  <dd className="text-brand-400">{o.tapuz_tracking_number}</dd>
                </div>
              )}
            </dl>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            {t('confirmation_sent')}{' '}
            <span className="text-gray-300">{o.email}</span>
          </p>

          <Link
            href="/"
            className="mt-8 inline-block rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 px-8 py-3 font-semibold text-white transition-opacity hover:opacity-90"
          >
            {t('back')}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
