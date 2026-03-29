import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { invalidateCmsCache } from '@/lib/cms'

function authorized(request: Request) {
  const auth = request.headers.get('Authorization')
  return auth === `Bearer ${process.env.ADMIN_PASSWORD}`
}

// GET — fetch product copy
export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('cms_product_copy')
      .select('data')
      .eq('key', 'main')
      .single()

    if (error) throw new Error(error.message)
    return NextResponse.json(data?.data ?? {})
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}

// PATCH — update product copy fields
export async function PATCH(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const fields = (await request.json()) as Record<string, unknown>

    const supabase = createServiceClient()

    // Fetch current data, merge fields, then upsert
    const { data: current } = await supabase
      .from('cms_product_copy')
      .select('data')
      .eq('key', 'main')
      .single()

    const merged = { ...(current?.data ?? {}), ...fields }

    const { error } = await supabase
      .from('cms_product_copy')
      .upsert({ key: 'main', data: merged }, { onConflict: 'key' })

    if (error) throw new Error(error.message)
    invalidateCmsCache('product')
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
