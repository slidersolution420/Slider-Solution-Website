import { NextResponse } from 'next/server'
import { checkoutSchema } from '@/lib/schemas'
import { initiatePayment } from '@/lib/hype'
import { createServiceClient } from '@/lib/supabase-server'
import { convertPrice, B2C_PRICE_USD } from '@/lib/currency'
import { getShippingCost } from '@/lib/shipping'
import { getConfig } from '@/lib/config'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown
    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, email, phone, address, city, country, zip, currency, items } = parsed.data

    // Calculate totals — use server-known price, never trust client-supplied priceUsd
    const totalQty = items.reduce((sum, i) => sum + i.quantity, 0)
    const subtotalUsd = totalQty * B2C_PRICE_USD
    const cfg = await getConfig()
    const shippingUsd = getShippingCost(country, totalQty, {
      freeCountries: cfg.free_shipping_countries,
      minQty: cfg.free_shipping_min_qty,
      intlCost: cfg.intl_paid_shipping_usd,
    })
    const totalUsd = subtotalUsd + shippingUsd
    const totalIls = convertPrice(totalUsd, 'ILS')

    // Save full order data to cart_sessions.
    // The session UUID becomes the Hype Order reference so we can look it up after payment.
    const supabase = createServiceClient()
    const cartPayload = {
      items,
      customer: { name, email, phone, address, city, country, zip },
      totalUsd: Math.round(totalUsd * 100) / 100,
      totalIls: Math.round(totalIls),
    }

    const { data: session, error: sessionError } = await supabase
      .from('cart_sessions')
      .upsert(
        { email, cart: cartPayload, status: 'active' },
        { onConflict: 'email' }
      )
      .select('id')
      .single()

    if (sessionError ?? !session) {
      console.error('Cart session error:', sessionError)
      return NextResponse.json({ error: 'Session error' }, { status: 500 })
    }

    // Build Hype item list for the receipt — use server-known per-item ILS price
    const priceIlsPerKit = Math.round(B2C_PRICE_USD * 3.7)
    const hypeItems = items.map(i => ({
      name: i.color ? `Slider Kit (${i.color})` : 'Slider Cone Kit',
      quantity: i.quantity,
      priceIls: priceIlsPerKit,
    }))

    const result = await initiatePayment({
      name,
      email,
      phone,
      address,
      city,
      country,
      zip,
      items: hypeItems,
      totalIls: Math.round(totalIls),
      orderRef: session.id,
    })

    return NextResponse.json({
      payment_url: result.payment_url,
      order_ref: result.order_ref,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Checkout error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
