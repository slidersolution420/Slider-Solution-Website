import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { password } = (await request.json()) as { password?: string }

  if (!password || password !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }

  const jar = await cookies()
  jar.set('admin_auth', process.env.CRON_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })

  return NextResponse.json({ ok: true })
}
