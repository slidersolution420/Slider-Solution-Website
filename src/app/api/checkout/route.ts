import { NextResponse } from 'next/server'
import { checkoutSchema } from '@/lib/schemas'
import { initiatePayment } from '@/lib/hype'
import { createServiceClient } from '@/lib/supabase-server'
import { convertPrice } from '@/lib/currency'
import { getShippingCost } from '@/lib/shipping'
import { getConfig } from '@/lib/config'
import { calcPrice } from '@/lib/pricing'

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
    const cfg = await getConfig()
    const { discountedUsd: effectivePrice } = calcPrice(cfg.price_b2c_usd, cfg.discount_pct_b2c)
    const totalQty = items.reduce((sum, i) => sum + i.quantity, 0)
    const subtotalUsd = totalQty * effectivePrice
    const shippingUsd = getShippingCost(country, totalQty, {
      freeCountries: cfg.free_shipping_countries,
      minQty: cfg.free_shipping_min_qty,
      intlCost: cfg.intl_paid_shipping_usd,
    })
    const totalUsd = subtotalUsd + shippingUsd
    const isUsd = currency === 'USD'
    const totalIls = isUsd ? null : convertPrice(totalUsd, 'ILS')

    // Save full order data to cart_sessions.
    // The session UUID becomes the Hype Order reference so we can look it up after payment.
    const supabase = createServiceClient()
    const cartPayload = {
      items,
      customer: { name, email, phone, address, city, country, zip },
      totalUsd: Math.round(totalUsd * 100) / 100,
      ...(totalIls != null ? { totalIls: Math.round(totalIls) } : {}),
      chargeCurrency: currency,
    }

    const { data: existing, error: selectError } = await supabase
      .from('cart_sessions')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    let sessionId: string

    if (existing) {
      const { error: updateError } = await supabase
        .from('cart_sessions')
        .update({ cart: cartPayload, status: 'active', updated_at: new Date().toISOString() })
        .eq('email', email)
      if (updateError) throw new Error(`Cart session update error: ${updateError.message} (${updateError.code})`)
      sessionId = existing.id
    } else {
      const { data: newSession, error: insertError } = await supabase
        .from('cart_sessions')
        .insert({ email, cart: cartPayload, status: 'active' })
        .select('id')
        .single()
      if (insertError) throw new Error(`Cart session insert error: ${insertError.message} (${insertError.code})`)
      sessionId = newSession.id
    }

    // Build Hype item list for the receipt — use server-known per-item price in charge currency
    const pricePerKit = isUsd ? effectivePrice : convertPrice(effectivePrice, 'ILS')
    const hypeItems = items.map(i => ({
      name: i.color ? `Slider Kit (${i.color})` : 'Slider Cone Kit',
      quantity: i.quantity,
      price: pricePerKit,
    }))

    const chargeTotal = isUsd ? Math.round(totalUsd) : Math.round(totalIls!)

    const result = await initiatePayment({
      name,
      email,
      phone,
      address,
      city,
      country,
      zip,
      items: hypeItems,
      total: chargeTotal,
      orderRef: sessionId,
      currency: isUsd ? 'USD' : 'ILS',
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
