import { getTranslations, getLocale } from 'next-intl/server'
import Link from 'next/link'

export default async function ProblemPage() {
  const [t, locale] = await Promise.all([getTranslations('errors'), getLocale()])
  const homeHref = locale === 'en' ? '/' : `/${locale}`
  const checkoutHref = locale === 'en' ? '/checkout' : `/${locale}/checkout`

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-0)] px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-white mb-2">{t('paymentFailed')}</h1>
        <p className="text-[var(--color-surface-5)] mb-6">{t('paymentFailedBody')}</p>
        <div className="flex gap-3 justify-center">
          <Link href={checkoutHref} className="btn-primary">
            {t('tryAgain')}
          </Link>
          <Link
            href={homeHref}
            className="px-6 py-3 rounded-xl border border-[var(--color-surface-3)] text-[var(--color-surface-5)] hover:text-white transition-colors"
          >
            {t('backHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}
