import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()

    // Find active carts with an email that haven't been updated in 60+ minutes
    const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const { data: abandoned } = await supabase
      .from('cart_sessions')
      .select('*')
      .eq('status', 'active')
      .not('email', 'is', null)
      .lt('updated_at', sixtyMinutesAgo)
      .limit(50)

    if (!abandoned?.length) {
      return NextResponse.json({ processed: 0 })
    }

    let processed = 0
    for (const session of abandoned) {
      try {
        // Send abandoned cart email via Resend
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/abandoned-cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CRON_SECRET}`,
          },
          body: JSON.stringify({ email: session.email, cart: session.cart }),
        })

        // Mark as abandoned so we don't email again
        await supabase
          .from('cart_sessions')
          .update({ status: 'abandoned' })
          .eq('id', session.id)

        processed++
      } catch {
        // Continue processing others if one fails
      }
    }

    return NextResponse.json({ processed })
  } catch (err) {
    console.error('Abandoned cart cron error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
