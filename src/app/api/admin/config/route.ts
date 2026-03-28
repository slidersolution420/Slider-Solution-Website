import { NextResponse } from 'next/server'
import { updateConfig } from '@/lib/config'
import type { SiteConfig } from '@/lib/types'

export async function PATCH(request: Request) {
  const auth = request.headers.get('Authorization')
  if (!auth || auth !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as { key: string; value: unknown }
    const { key, value } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'key and value required' }, { status: 400 })
    }

    await updateConfig(key as keyof SiteConfig, value as SiteConfig[keyof SiteConfig])
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Update failed' },
      { status: 500 }
    )
  }
}
