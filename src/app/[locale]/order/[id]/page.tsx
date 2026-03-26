import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createServiceClient } from '@/lib/supabase-server'
import NavBar from '@/components/ui/NavBar'
import Footer from '@/components/ui/Footer'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import type { Order } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Order Confirmed — SLIDER',
}

interface OrderPageProps {
  params: Promise<{ locale: string; id: string }>
}

function OrderDetails({ order, locale }: { order: Order; locale: string }) {
  const isHe = locale === 'he'

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-surface pt-24 pb-16">
        <div className="mx-auto max-w-lg px-4 text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircleIcon className="size-16 text-green-400" />
          </div>

          <h1 className="mb-2 text-2xl font-bold text-white">
            {isHe ? 'ההזמנה התקבלה!' : 'Order Received!'}
          </h1>
          <p className="mb-8 text-gray-400">
            {isHe ? 'תודה על הרכישה' : 'Thank you for your purchase'}
          </p>

          <div className="rounded-2xl border border-white/10 bg-gray-900 p-6 text-start">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">{isHe ? 'מספר הזמנה' : 'Order #'}</dt>
                <dd className="font-mono text-white">{order.id.slice(0, 8).toUpperCase()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">{isHe ? 'סה"כ' : 'Total'}</dt>
                <dd className="font-semibold text-white">${order.total_usd.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">{isHe ? 'סטטוס' : 'Status'}</dt>
                <dd className="capitalize text-green-400">{order.status}</dd>
              </div>
              {order.tapuz_tracking_number && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">{isHe ? 'מעקב' : 'Tracking'}</dt>
                  <dd className="text-brand-400">{order.tapuz_tracking_number}</dd>
                </div>
              )}
            </dl>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            {isHe ? 'אישור נשלח ל:' : 'Confirmation sent to:'}{' '}
            <span className="text-gray-300">{order.email}</span>
          </p>

          <Link
            href="/"
            className="mt-8 inline-block rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 px-8 py-3 font-semibold text-white transition-opacity hover:opacity-90"
          >
            {isHe ? 'חזרה לחנות' : 'Back to Shop'}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
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

  return <OrderDetails order={order as Order} locale={locale} />
}
