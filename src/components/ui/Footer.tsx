import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function Footer() {
  const t = useTranslations('footer')
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">
                <span className="text-sm font-bold text-white">S</span>
              </div>
              <span className="text-lg font-bold text-white">SLIDER</span>
            </div>
            <p className="text-sm text-gray-500">{t('tagline')}</p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Pages
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: t('home') },
                { href: '/contact', label: t('contact') },
                { href: '/wholesale', label: t('wholesale') },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Legal
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/terms', label: t('terms') },
                { href: '/refund', label: t('refund') },
                { href: '/cookies', label: t('cookies') },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-gray-600">
          © {year} Slider Solution. {t('copyright')}.
        </div>
      </div>
    </footer>
  )
}
