import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/ratelimit'

const schema = z.object({
  name: z.string().min(2).max(100),
  rating: z.number().int().min(1).max(5),
  body: z.string().min(10).max(2000),
})

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!rateLimit(ip, 5)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const body = (await request.json()) as unknown
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase.from('reviews').insert({
      name: parsed.data.name,
      rating: parsed.data.rating,
      body: parsed.data.body,
      approved: false,
    })

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Review submission error:', err)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
