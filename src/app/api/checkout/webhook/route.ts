import { NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/hype'
import { createServiceClient } from '@/lib/supabase-server'
import { sendOrderConfirmation } from '@/lib/resend'

export async function POST(request: Request) {
  const payload = await request.text()
  const signature = request.headers.get('x-hype-signature') ?? ''

  if (!verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: {
    type: string
    payment_id: string
    metadata?: {
      items?: string
      shipping_address?: string
    }
    amount?: number
    currency?: string
    customer_email?: string
  }

  try {
    event = JSON.parse(payload) as typeof event
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (event.type !== 'payment.success') {
    return NextResponse.json({ received: true })
  }

  try {
    const supabase = createServiceClient()

    const items = event.metadata?.items ? (JSON.parse(event.metadata.items) as unknown[]) : []
    const shippingAddress = event.metadata?.shipping_address
      ? (JSON.parse(event.metadata.shipping_address) as Record<string, string>)
      : {}

    const totalUsd = (event.amount ?? 0) / (event.currency === 'ILS' ? 3.7 : 1)

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        email: shippingAddress['email'] ?? event.customer_email ?? '',
        name: shippingAddress['name'] ?? '',
        shipping_address: shippingAddress,
        country: (shippingAddress['country'] as string | undefined) ?? 'IL',
        items,
        total_usd: Math.round(totalUsd * 100) / 100,
        status: 'paid',
        hype_payment_id: event.payment_id,
        type: 'b2c',
      })
      .select()
      .single()

    if (error) {
      console.error('Order insert error:', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    // Mark cart session as completed
    if (shippingAddress['email']) {
      await supabase
        .from('cart_sessions')
        .update({ status: 'completed' })
        .eq('email', shippingAddress['email'])
        .eq('status', 'active')
    }

    // Send confirmation email (non-blocking)
    if (order) {
      void sendOrderConfirmation(order).catch(console.error)
    }

    return NextResponse.json({ success: true, order_id: order?.id })
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
