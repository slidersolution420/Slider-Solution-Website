import { NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/hype'
import { EXCHANGE_RATES } from '@/lib/currency'
import { createServiceClient } from '@/lib/supabase-server'
import { sendOrderConfirmation, sendAdminOrderAlert } from '@/lib/resend'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>

    console.error('[verify route] incoming params:', JSON.stringify(body))
    const { verified, rawResponse } = await verifyPayment(body)
    console.error('[verify route] verifyPayment result:', verified, '| hypeResponse:', rawResponse)
    if (!verified) {
      return NextResponse.json(
        { error: 'Payment verification failed', hypeResponse: rawResponse },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    const { Order: orderRef, Id: hypeTxId, Amount: amountStr } = body

    // Guard against duplicate processing
    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('hype_payment_id', hypeTxId ?? orderRef)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ success: true, order_id: existing.id })
    }

    // Retrieve customer + cart data from the session we saved at checkout
    const { data: cartSession } = await supabase
      .from('cart_sessions')
      .select('*')
      .eq('id', orderRef)
      .single()

    type CartPayload = {
      items: unknown[]
      customer: {
        name: string
        email: string
        phone: string
        address: string
        city: string
        country: string
        zip: string
      }
      totalUsd: number
      totalIls: number
    }

    const cart = cartSession?.cart as CartPayload | null
    const customer = cart?.customer
    const totalUsd = cart?.totalUsd ?? Math.round((parseFloat(amountStr ?? '0') / EXCHANGE_RATES.ILS) * 100) / 100

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        email: customer?.email ?? '',
        name: customer?.name ?? '',
        shipping_address: customer ?? {},
        country: customer?.country ?? 'IL',
        items: cart?.items ?? [],
        total_usd: Math.round(totalUsd * 100) / 100,
        status: 'paid',
        hype_payment_id: hypeTxId ?? orderRef,
        type: 'b2c',
      })
      .select()
      .single()

    if (error) {
      console.error('Order insert error:', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    // Mark cart session as completed
    if (orderRef) {
      await supabase
        .from('cart_sessions')
        .update({ status: 'completed' })
        .eq('id', orderRef)
    }

    // Send emails (non-blocking): customer confirmation + admin alert
    if (order) {
      void sendOrderConfirmation(order).catch(console.error)
      void sendAdminOrderAlert(order).catch(console.error)
    }

    return NextResponse.json({ success: true, order_id: order?.id })
  } catch (err) {
    console.error('Verify error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
