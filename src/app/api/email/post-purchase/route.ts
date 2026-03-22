import { createServiceClient } from '@/lib/supabase-server'
import { sendHowToUse, sendLeaveReview } from '@/lib/resend'
import type { Order } from '@/lib/types'

function isBearerAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  const auth = request.headers.get('Authorization') ?? ''
  return auth === `Bearer ${secret}`
}

export async function POST(request: Request): Promise<Response> {
  if (!isBearerAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const now = new Date()

  // Day +3 window: orders created 3–4 days ago
  const day3Start = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString()
  const day3End = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()

  // Day +14 window: orders created 14–15 days ago
  const day14Start = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString()
  const day14End = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const results = { howToUse: 0, leaveReview: 0, errors: 0 }

  // How To Use — Day +3
  const { data: day3Orders } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'paid')
    .gte('created_at', day3Start)
    .lt('created_at', day3End)

  for (const row of day3Orders ?? []) {
    try {
      const order: Order = {
        id: String(row.id ?? ''),
        email: String(row.email ?? ''),
        name: String(row.name ?? ''),
        shipping_address: row.shipping_address as Order['shipping_address'],
        country: String(row.country ?? ''),
        items: (row.items as Order['items']) ?? [],
        total_usd: Number(row.total_usd ?? 0),
        status: (row.status as Order['status']) ?? 'paid',
        hype_payment_id: String(row.hype_payment_id ?? ''),
        tapuz_tracking_number: String(row.tapuz_tracking_number ?? ''),
        type: (row.type as Order['type']) ?? 'b2c',
        created_at: String(row.created_at ?? ''),
      }
      await sendHowToUse(order)
      results.howToUse++
    } catch (err) {
      console.error('[post-purchase] sendHowToUse error for order', row.id, err)
      results.errors++
    }
  }

  // Leave a Review — Day +14
  const { data: day14Orders } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'paid')
    .gte('created_at', day14Start)
    .lt('created_at', day14End)

  for (const row of day14Orders ?? []) {
    try {
      const order: Order = {
        id: String(row.id ?? ''),
        email: String(row.email ?? ''),
        name: String(row.name ?? ''),
        shipping_address: row.shipping_address as Order['shipping_address'],
        country: String(row.country ?? ''),
        items: (row.items as Order['items']) ?? [],
        total_usd: Number(row.total_usd ?? 0),
        status: (row.status as Order['status']) ?? 'paid',
        hype_payment_id: String(row.hype_payment_id ?? ''),
        tapuz_tracking_number: String(row.tapuz_tracking_number ?? ''),
        type: (row.type as Order['type']) ?? 'b2c',
        created_at: String(row.created_at ?? ''),
      }
      await sendLeaveReview(order)
      results.leaveReview++
    } catch (err) {
      console.error('[post-purchase] sendLeaveReview error for order', row.id, err)
      results.errors++
    }
  }

  return Response.json({ ok: true, results })
}
