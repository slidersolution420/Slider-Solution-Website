export async function GET() {
  return new Response(
    'User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: https://slidersolution.com/sitemap.xml',
    { headers: { 'Content-Type': 'text/plain' } },
  )
}
