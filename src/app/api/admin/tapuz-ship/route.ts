import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase-server'
import { createShipment } from '@/lib/tapuz'
import type { Order } from '@/lib/types'

const bodySchema = z.object({
  orderId: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: unknown = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { orderId } = parsed.data
  const supabase = createServiceClient()

  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  try {
    const result = await createShipment(order as Order)
    await supabase
      .from('orders')
      .update({
        delivery_number: result.deliveryNumber,
        tapuz_branch: result.branch,
        tapuz_sent_at: new Date().toISOString(),
        tapuz_error: null,
      })
      .eq('id', orderId)

    return NextResponse.json({ success: true, delivery_number: result.deliveryNumber })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    await supabase
      .from('orders')
      .update({
        tapuz_error: errMsg,
        tapuz_sent_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
