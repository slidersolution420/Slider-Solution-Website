import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

function authorized(request: Request) {
  const auth = request.headers.get('Authorization')
  return auth === `Bearer ${process.env.ADMIN_PASSWORD}`
}

interface RouteParams {
  params: Promise<{ slug: string }>
}

// GET — fetch a single page by slug
export async function GET(request: Request, { params }: RouteParams) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { slug } = await params
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('cms_pages')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw new Error(error.message)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}

// PATCH — update a page's sections
export async function PATCH(request: Request, { params }: RouteParams) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { slug } = await params
    const body = (await request.json()) as {
      title_he?: string
      title_en?: string
      title_es?: string
      title_de?: string
      sections_he?: unknown[]
      sections_en?: unknown[]
      sections_es?: unknown[]
      sections_de?: unknown[]
    }

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('cms_pages')
      .update(body)
      .eq('slug', slug)

    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
