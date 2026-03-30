import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { invalidateCmsCache } from '@/lib/cms'

function authorized(request: Request) {
  const auth = request.headers.get('Authorization')
  return auth === `Bearer ${process.env.ADMIN_PASSWORD}`
}

// GET — list all FAQ items
export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('cms_faq')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw new Error(error.message)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}

// POST — create new FAQ item
export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as {
      slug: string
      question_he: string
      question_en: string
      question_es?: string
      answer_he: string
      answer_en: string
      answer_es?: string
      sort_order: number
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('cms_faq')
      .insert(body)
      .select()
      .single()

    if (error) throw new Error(error.message)
    invalidateCmsCache('faq')
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}

// PATCH — update existing FAQ item by id
export async function PATCH(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as {
      id: string
      question_he?: string
      question_en?: string
      question_es?: string
      answer_he?: string
      answer_en?: string
      answer_es?: string
      sort_order?: number
    }

    const { id, ...fields } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('cms_faq')
      .update(fields)
      .eq('id', id)

    if (error) throw new Error(error.message)
    invalidateCmsCache('faq')
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}

// DELETE — remove FAQ item by id
export async function DELETE(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as { id: string }
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('cms_faq')
      .delete()
      .eq('id', body.id)

    if (error) throw new Error(error.message)
    invalidateCmsCache('faq')
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
