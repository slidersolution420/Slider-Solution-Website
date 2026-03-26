import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase-server'

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['active', 'blocked', 'pending']),
})

export async function PATCH(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: unknown = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { id, status } = parsed.data
  const supabase = createServiceClient()

  const update: Record<string, string | null> = { status }
  if (status === 'active') {
    update.approved_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('wholesale_accounts')
    .update(update)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
