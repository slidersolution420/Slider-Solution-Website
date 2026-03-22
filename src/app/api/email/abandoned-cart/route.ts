import { sendAbandonedCart } from '@/lib/resend'

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

  let body: { email?: string; cart?: unknown; country?: string }
  try {
    body = (await request.json()) as { email?: string; cart?: unknown; country?: string }
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, cart, country } = body

  if (!email || !Array.isArray(cart)) {
    return Response.json({ error: 'email and cart required' }, { status: 400 })
  }

  try {
    await sendAbandonedCart(
      email,
      cart as Array<{ color: string; qty: number; priceUsd: number }>,
      country ?? '',
    )
    return Response.json({ ok: true })
  } catch (err) {
    console.error('[email/abandoned-cart] Error:', err)
    return Response.json({ error: 'Email send failed' }, { status: 500 })
  }
}
