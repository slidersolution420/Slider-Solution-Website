/**
 * next-intl locale detection and routing.
 * Must be named middleware.ts — Next.js only recognises this filename.
 */
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     *   - api routes
     *   - Next.js internals (_next, _vercel)
     *   - /keystatic and everything under it
     *   - files with extensions (images, fonts, etc.)
     */
    '/((?!api|_next|_vercel|keystatic(?:/.*)?|.*\\..*).*)',
  ],
}
