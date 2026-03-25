/**
 * Next.js 16 uses proxy.ts instead of middleware.ts for routing.
 * next-intl locale detection and routing runs here.
 */
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: [
    // Match all paths except api, _next internals, keystatic editor, and static files
    '/((?!api|_next|_vercel|keystatic|.*\\..*).*)',
  ],
}
