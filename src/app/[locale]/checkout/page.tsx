import { getConfig } from '@/lib/config'
import CheckoutClient from './CheckoutClient'

export const dynamic = 'force-dynamic'

interface CheckoutPageProps {
  params: Promise<{ locale: string }>
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale } = await params
  const cfg = await getConfig()
  const defaultCountry = locale === 'he' ? 'IL' : 'US'
  return <CheckoutClient discountPct={cfg.discount_pct_b2c} priceUsd={cfg.price_b2c_usd} defaultCountry={defaultCountry} />
}
