/**
 * lib/hype.ts
 * Hype payment gateway integration — Wave 2 full implementation.
 */

import crypto from 'crypto'

const HYPE_API_KEY = process.env.HYPE_API_KEY ?? ''
const HYPE_REFERER = process.env.HYPE_REFERER ?? ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export interface HypePaymentSession {
  sessionUrl: string
  sessionId: string
}

export interface CustomerInfo {
  name: string
  email: string
  address: string
  city: string
  country: string
  zip: string
}

/** Minimal cart shape — only priceUsd + qty are used for total calculation. */
type CartLineItem = {
  priceUsd: number
  qty: number
}

export async function initiatePayment(
  cart: CartLineItem[],
  customer: CustomerInfo,
  _currency: string = 'USD',
): Promise<HypePaymentSession> {
  const totalUsd = cart.reduce((sum, item) => sum + item.priceUsd * item.qty, 0)

  const response = await fetch('https://api.hyp-e.com/payment/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${HYPE_API_KEY}`,
      'X-Api-Key': HYPE_API_KEY,
      Referer: HYPE_REFERER,
      'X-Referer': HYPE_REFERER,
    },
    body: JSON.stringify({
      amount: Math.round(totalUsd * 100),
      currency: 'USD',
      customer_name: customer.name,
      customer_email: customer.email,
      success_url: `${APP_URL}/en/order/{session_id}`,
      cancel_url: `${APP_URL}/en/checkout`,
      webhook_url: `${APP_URL}/api/checkout/webhook`,
      metadata: {
        cart: JSON.stringify(cart),
        country: customer.country,
      },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Hype initiatePayment failed ${response.status}: ${text}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await response.json()) as Record<string, any>

  const sessionUrl: string | undefined =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    data.payment_url ?? data.url ?? data.redirect_url ?? data.checkout_url

  const rawId: unknown =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    data.session_id ?? data.id ?? data.payment_id ?? data.transaction_id

  if (!sessionUrl) {
    throw new Error(
      `Hype: no redirect URL in response: ${JSON.stringify(data)}`,
    )
  }

  return { sessionUrl, sessionId: String(rawId ?? '') }
}

export function verifyWebhookSignature(
  headers: Headers,
  rawBody: string,
): boolean {
  const secret = process.env.HYPE_WEBHOOK_SECRET
  if (!secret) return true

  const sig =
    headers.get('x-hype-signature') ??
    headers.get('x-signature') ??
    headers.get('x-webhook-signature') ??
    ''

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  return sig === expected || sig === `sha256=${expected}`
}
