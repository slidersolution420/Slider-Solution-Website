'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import WholesaleModal from '@/components/wholesale/WholesaleModal'
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline'

interface WholesaleLandingProps {
  locale: string
}

export default function WholesaleLanding({ locale }: WholesaleLandingProps) {
  const t = useTranslations('wholesale')
  const [modalOpen, setModalOpen] = useState(false)
  const router = useRouter()

  function handleSuccess() {
    setModalOpen(false)
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-surface pt-24 pb-16">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-brand-900/50">
            <BuildingStorefrontIcon className="size-10 text-brand-400" />
          </div>
        </div>

        <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl">{t('cta_title')}</h1>
        <p className="mb-8 text-lg text-gray-400">{t('cta_sub')}</p>

        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {[
            { value: '$82', label: locale === 'he' ? 'לקופסת תצוגה' : 'Per display box' },
            { value: '6', label: locale === 'he' ? 'קיטים בקופסה' : 'Kits per box' },
            { value: '30%', label: locale === 'he' ? 'חיסכון' : 'Savings vs retail' },
          ].map((stat) => (
            <div
              key={stat.value}
              className="rounded-xl border border-white/10 bg-gray-900/50 p-4"
            >
              <p className="text-2xl font-bold text-brand-400">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-block rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 px-10 py-4 text-lg font-bold text-white transition-opacity hover:opacity-90"
        >
          {t('cta_button')}
        </button>
      </div>

      {modalOpen && (
        <WholesaleModal onClose={() => setModalOpen(false)} onSuccess={handleSuccess} />
      )}
    </main>
  )
}
