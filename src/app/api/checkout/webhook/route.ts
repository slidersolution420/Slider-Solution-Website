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

  // Delivery + email triggers come in Wave 3

  return Response.json({ received: true })
}
