/**
 * supabase/functions/abandoned-cart/index.ts
 * Deno Edge Function — queries cart_sessions older than 60 min
 * with status='active' and triggers abandoned cart emails.
 *
 * Deploy: supabase functions deploy abandoned-cart
 * Schedule via Supabase Dashboard → Database → Cron Jobs (pg_cron)
 *   cron: '*/15 * * * *'  (every 15 minutes)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface CartSession {
  id: string
  email: string
  cart: Array<{ color: string; qty: number; priceUsd: number }>
  country?: string
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Validate cron secret
  const cronSecret = Deno.env.get('CRON_SECRET')
  if (cronSecret) {
    const auth = req.headers.get('Authorization') ?? ''
    if (auth !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  const supabase = createClient(
    Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const appUrl = Deno.env.get('NEXT_PUBLIC_APP_URL') ?? 'http://localhost:3000'

  // Find active sessions older than 60 minutes
  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const { data: sessions, error } = await supabase
    .from('cart_sessions')
    .select('id, email, cart, country')
    .eq('status', 'active')
    .lt('created_at', cutoff)
    .limit(50)

  if (error) {
    console.error('[abandoned-cart] Fetch error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const processed: string[] = []

  for (const session of (sessions ?? []) as CartSession[]) {
    try {
      // Trigger abandoned cart email
      const res = await fetch(`${appUrl}/api/email/abandoned-cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cronSecret ?? ''}`,
        },
        body: JSON.stringify({
          email: session.email,
          cart: session.cart ?? [],
          country: session.country ?? '',
        }),
      })

      if (!res.ok) {
        console.error(`[abandoned-cart] Email send failed for ${session.id}: ${res.status}`)
      }

      // Mark session as abandoned
      await supabase
        .from('cart_sessions')
        .update({ status: 'abandoned' })
        .eq('id', session.id)

      processed.push(session.id)
    } catch (err) {
      console.error(`[abandoned-cart] Error for session ${session.id}:`, err)
    }
  }

  return new Response(
    JSON.stringify({ processed: processed.length, ids: processed }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
