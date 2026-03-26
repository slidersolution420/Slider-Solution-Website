import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function PATCH(request: Request) {
  const auth = request.headers.get('Authorization')
  if (!auth || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as { id: string; approved: boolean }
    const { id, approved } = body

    if (!id || typeof approved !== 'boolean') {
      return NextResponse.json({ error: 'id and approved required' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('reviews')
      .update({ approved })
      .eq('id', id)

    if (error) throw new Error(error.message)

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Update failed' },
      { status: 500 }
    )
  }
}
