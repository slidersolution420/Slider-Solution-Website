import { getConfig } from '@/lib/config'
import CheckoutClient from './CheckoutClient'

export const dynamic = 'force-dynamic'

interface CheckoutPageProps {
  params: Promise<{ locale: string }>
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale } = await params
  const cfg = await getConfig()
  const countryMap: Record<string, string> = { he: 'IL', es: 'ES', de: 'DE' }
  const defaultCountry = countryMap[locale] ?? 'US'
  return <CheckoutClient discountPct={cfg.discount_pct_b2c} priceUsd={cfg.price_b2c_usd} defaultCountry={defaultCountry} />
}
