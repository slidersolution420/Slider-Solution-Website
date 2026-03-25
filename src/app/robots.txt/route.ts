import { NextResponse } from 'next/server'

export function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://slidersolution.com'
  const content = `User-agent: *
Allow: /

Disallow: /keystatic
Disallow: /api/

Sitemap: ${appUrl}/sitemap.xml
`
  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
