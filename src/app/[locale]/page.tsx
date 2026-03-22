import { useTranslations } from 'next-intl'

export default function HomePage() {
  const t = useTranslations('hero')

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="font-syne font-bold text-4xl text-white">
          {t('headline')}
        </h1>
        <p className="font-outfit text-grey-muted">{t('subheadline')}</p>
        <p className="text-purple text-sm">Wave 0 foundation complete ✓</p>
      </div>
    </main>
  )
}
