import crypto from 'crypto'
import type { CartItem, ShippingAddress } from './types'
import { getShippingCost } from './shipping'
import { convertPrice } from './currency'

export interface HypePaymentSession {
  payment_url: string
  payment_id: string
}

export interface CustomerInfo extends ShippingAddress {
  items: CartItem[]
  currency: 'ILS' | 'USD'
}

export async function initiatePayment(customer: CustomerInfo): Promise<HypePaymentSession> {
  const apiKey = process.env.HYPE_API_KEY
  const referer = process.env.HYPE_REFERER ?? 'https://slidersolution.com'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://slidersolution.com'

  if (!apiKey) {
    // Mock mode for development
    const mockId = `mock_${Date.now()}`
    return {
      payment_url: `${appUrl}/order/${mockId}?mock=1`,
      payment_id: mockId,
    }
  }

  const totalQty = customer.items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotalUsd = customer.items.reduce((sum, item) => sum + item.priceUsd * item.quantity, 0)
  const shippingUsd = getShippingCost(customer.country, totalQty)
  const totalUsd = subtotalUsd + shippingUsd

  const amount =
    customer.currency === 'ILS'
      ? convertPrice(totalUsd, 'ILS')
      : totalUsd

  const payload = {
    amount,
    currency: customer.currency,
    customer_name: customer.name,
    customer_email: customer.email,
    customer_phone: customer.phone,
    success_url: `${appUrl}/api/checkout/webhook`,
    cancel_url: `${appUrl}/checkout`,
    metadata: {
      items: JSON.stringify(customer.items),
      shipping_address: JSON.stringify({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        country: customer.country,
        zip: customer.zip,
      }),
    },
  }

  const res = await fetch('https://api.hyp-e.com/v1/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      Referer: referer,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Hype API error: ${error}`)
  }

  const data = (await res.json()) as { payment_url: string; id: string }
  return {
    payment_url: data.payment_url,
    payment_id: data.id,
  }
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.HYPE_WEBHOOK_SECRET
  if (!secret) return true // Dev mode — skip verification

  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}
