import { NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/hype'
import { EXCHANGE_RATES } from '@/lib/currency'
import { createServiceClient } from '@/lib/supabase-server'
import { sendOrderConfirmation, sendAdminOrderAlert } from '@/lib/resend'
import { createShipment } from '@/lib/tapuz'
import type { Order, CartPayload } from '@/lib/types'

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
      .select('id, delivery_number')
      .eq('hype_payment_id', hypeTxId ?? orderRef)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        success: true,
        order_id: existing.id,
        delivery_number: (existing as { delivery_number: string | null }).delivery_number ?? null,
      })
    }

    // Retrieve customer + cart data from the session we saved at checkout
    const { data: cartSession } = await supabase
      .from('cart_sessions')
      .select('*')
      .eq('id', orderRef)
      .single()

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

    // Intentional: auto-create Tapuz shipment on every successful payment.
    // Failures are caught and stored in tapuz_error — never block the customer.
    let deliveryNumber: string | null = null
    if (order) {
      try {
        const tapuzResult = await createShipment(order as Order)
        deliveryNumber = tapuzResult.deliveryNumber
        await supabase
          .from('orders')
          .update({
            delivery_number: tapuzResult.deliveryNumber,
            tapuz_branch: tapuzResult.branch,
            tapuz_sent_at: new Date().toISOString(),
          })
          .eq('id', order.id)
      } catch (tapuzErr) {
        const errMsg = tapuzErr instanceof Error ? tapuzErr.message : String(tapuzErr)
        console.error('[Tapuz] Shipment creation failed:', errMsg)
        await supabase
          .from('orders')
          .update({
            tapuz_error: errMsg,
            tapuz_sent_at: new Date().toISOString(),
          })
          .eq('id', order.id)
      }
    }

    return NextResponse.json({ success: true, order_id: order?.id, delivery_number: deliveryNumber })
  } catch (err) {
    console.error('Verify error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
