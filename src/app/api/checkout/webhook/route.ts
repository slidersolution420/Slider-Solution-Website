import { verifyWebhookSignature } from '@/lib/hype'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text()

  if (process.env.HYPE_WEBHOOK_SECRET) {
    const valid = verifyWebhookSignature(request.headers, rawBody)
    if (!valid) {
      console.warn('[webhook] Invalid Hype signature')
      return Response.json({ error: 'Invalid signature' }, { status: 403 })
    }
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const paymentId = String(
    payload.session_id ??
      payload.id ??
      payload.payment_id ??
      'unknown',
  )

  try {
    const cartRaw =
      typeof payload.cart === 'string' ? JSON.parse(payload.cart) : []

    const { error: orderError } = await supabase.from('orders').upsert(
      {
        email: String(payload.customer_email ?? payload.email ?? ''),
        name: String(payload.customer_name ?? payload.name ?? ''),
        shipping_address:
          (payload.customer as Record<string, unknown> | undefined) ?? {},
        country: String(payload.country ?? ''),
        items: cartRaw,
        total_usd: Number(payload.amount ?? 0) / 100,
        status: 'paid',
        hype_payment_id: paymentId,
        type: String(payload.order_type ?? 'b2c'),
      },
      { onConflict: 'hype_payment_id' },
    )

    if (orderError) console.error('[webhook] Order write error:', orderError)
  } catch (err) {
    console.error('[webhook] DB error:', err)
    // Never let a DB error break the webhook response
  }

  const cartSessionId = payload.cart_session_id as string | undefined
  if (cartSessionId) {
    await supabase
      .from('cart_sessions')
      .update({ status: 'completed' })
      .eq('id', cartSessionId)
  }

  // Fire delivery trigger (creates shipment + sends confirmation email)
  try {
    const { data: newOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('hype_payment_id', paymentId)
      .single()

    if (newOrder?.id) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
      fetch(`${appUrl}/api/delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: newOrder.id }),
      }).catch((err: unknown) =>
        console.error('[webhook] delivery trigger failed:', err),
      )
    }
  } catch (err) {
    console.error('[webhook] delivery lookup failed:', err)
  }

  return Response.json({ received: true })
}
