import { createServiceClient } from '@/lib/supabase-server'
import { createShipment } from '@/lib/tapuz'
import { sendOrderConfirmation } from '@/lib/resend'
import type { Order } from '@/lib/types'

export async function POST(request: Request): Promise<Response> {
  let body: { orderId?: string }
  try {
    body = (await request.json()) as { orderId?: string }
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { orderId } = body
  if (!orderId) {
    return Response.json({ error: 'orderId required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (fetchError || !order) {
    console.error('[delivery] Order not found:', orderId, fetchError)
    return Response.json({ error: 'Order not found' }, { status: 404 })
  }

  // Create Tapuz shipment
  try {
    const shipment = await createShipment({
      orderId: order.id as string,
      recipient: {
        name: String(order.name ?? ''),
        email: String(order.email ?? ''),
        line1: String(
          (order.shipping_address as Record<string, unknown> | null)?.line1 ?? '',
        ),
        city: String(
          (order.shipping_address as Record<string, unknown> | null)?.city ?? '',
        ),
        country: String(order.country ?? ''),
        zip: String(
          (order.shipping_address as Record<string, unknown> | null)?.zip ?? '',
        ),
      },
      packageCount: 1,
    })

    // Update order with tracking number
    const { error: updateError } = await supabase
      .from('orders')
      .update({ tapuz_tracking_number: shipment.trackingNumber, status: 'shipped' })
      .eq('id', orderId)

    if (updateError) {
      console.error('[delivery] Failed to update tracking number:', updateError)
    }
  } catch (err) {
    console.error('[delivery] createShipment error:', err)
    // Non-fatal — continue to send confirmation email
  }

  // Refetch order to get updated tracking number
  const { data: updatedOrder } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  // Send order confirmation email
  try {
    const orderForEmail: Order = {
      id: String((updatedOrder ?? order).id ?? ''),
      email: String((updatedOrder ?? order).email ?? ''),
      name: String((updatedOrder ?? order).name ?? ''),
      shipping_address: (updatedOrder ?? order).shipping_address as Order['shipping_address'],
      country: String((updatedOrder ?? order).country ?? ''),
      items: ((updatedOrder ?? order).items as Order['items']) ?? [],
      total_usd: Number((updatedOrder ?? order).total_usd ?? 0),
      status: ((updatedOrder ?? order).status as Order['status']) ?? 'paid',
      hype_payment_id: String((updatedOrder ?? order).hype_payment_id ?? ''),
      tapuz_tracking_number: String((updatedOrder ?? order).tapuz_tracking_number ?? ''),
      type: ((updatedOrder ?? order).type as Order['type']) ?? 'b2c',
      created_at: String((updatedOrder ?? order).created_at ?? ''),
    }

    await sendOrderConfirmation(orderForEmail)
  } catch (err) {
    console.error('[delivery] sendOrderConfirmation error:', err)
    // Non-fatal
  }

  return Response.json({ ok: true })
}
