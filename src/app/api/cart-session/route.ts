import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; cart?: unknown[] }
    if (!body.email || !body.cart?.length) {
      return NextResponse.json({ ok: false })
    }

    const supabase = createServiceClient()

    // Upsert cart session by email (one active session per email)
    await supabase.from('cart_sessions').upsert(
      {
        email: body.email,
        cart: body.cart,
        status: 'active',
      },
      {
        onConflict: 'email',
        ignoreDuplicates: false,
      }
    )

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
