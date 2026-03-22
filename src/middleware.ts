import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n'

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

export const config = {
  matcher: [
    // Match all pathnames except:
    // - /api routes
    // - /_next (Next.js internal)
    // - /favicon.ico, sitemap.xml, robots.txt
    // - Static files with extension
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
