import { getConfig } from '@/lib/config'
import CheckoutClient from './CheckoutClient'

export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  const cfg = await getConfig()
  return <CheckoutClient discountPct={cfg.discount_pct} priceUsd={cfg.price_b2c_usd} />
}
