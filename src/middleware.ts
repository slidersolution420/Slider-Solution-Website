/**
 * next-intl locale detection and routing + temporary-closure gate.
 * Must be named middleware.ts — Next.js only recognises this filename.
 *
 * While SITE_CLOSED is true (src/lib/site-status.ts):
 *   - every page outside OPEN_PAGE_PREFIXES 307-redirects to the locale's /closed page
 *   - every API outside OPEN_API_PREFIXES returns 503
 *   - admin, in-flight payment completion (/thankyou + verify) and cron stay reachable
 */
import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'
import { SITE_CLOSED } from './lib/site-status'

const intlMiddleware = createMiddleware({
  ...routing,
  localeDetection: false,
})

/** Path prefixes (after stripping the locale) that stay reachable while closed. */
const OPEN_PAGE_PREFIXES = ['/closed', '/admin', '/thankyou']
const OPEN_API_PREFIXES = ['/api/admin', '/api/checkout/verify', '/api/cron']

/** Non-default locales that appear as a URL prefix ('en' is prefix-less). */
const LOCALE_PREFIX = /^\/(he|es|de)(?=\/|$)/

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api')) {
    if (SITE_CLOSED && !OPEN_API_PREFIXES.some((p) => pathname.startsWith(p))) {
      return NextResponse.json(
        { error: 'Site temporarily closed' },
        { status: 503 },
      )
    }
    return NextResponse.next()
  }

  if (SITE_CLOSED) {
    const localeMatch = pathname.match(LOCALE_PREFIX)
    const locale = localeMatch ? localeMatch[1] : null
    const rest = locale ? pathname.slice(locale.length + 1) || '/' : pathname
    const isOpen = OPEN_PAGE_PREFIXES.some(
      (p) => rest === p || rest.startsWith(`${p}/`),
    )
    if (!isOpen) {
      const url = request.nextUrl.clone()
      url.pathname = locale ? `/${locale}/closed` : '/closed'
      url.search = ''
      return NextResponse.redirect(url, 307)
    }
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     *   - Next.js internals (_next, _vercel)
     *   - files with extensions (images, fonts, robots.txt, sitemap.xml, etc.)
     * NOTE: /api IS matched — the closure gate 503s non-allowlisted APIs.
     *       When SITE_CLOSED is false, /api passes straight through (same as before).
     */
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
}
