import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid'

const WHATSAPP_URL = 'https://wa.me/972524553311'
const WHATSAPP_DISPLAY = '+972 52-455-3311'

interface ClosedPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: ClosedPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'closed' })
  return { title: t('metaTitle') }
}

export default async function ClosedPage({ params }: ClosedPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'closed' })

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-brand-400 text-sm font-semibold tracking-widest uppercase">
        Slider Solution
      </p>
      <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{t('title')}</h1>
      <p className="mt-4 max-w-md text-lg text-white/70">{t('body')}</p>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#25D366] px-8 py-4 text-lg font-semibold text-black transition-transform hover:scale-105"
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" aria-hidden="true" />
        {t('cta')}
      </a>
      <p className="mt-3 text-sm text-white/50" dir="ltr">
        {WHATSAPP_DISPLAY}
      </p>
    </main>
  )
}
