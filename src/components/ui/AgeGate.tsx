'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useStore } from '@/store'

export default function AgeGate() {
  const t = useTranslations('ageGate')
  const { ageVerified, setAgeVerified } = useStore()
  const yesRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!ageVerified) {
      // Focus the confirm button on mount
      yesRef.current?.focus()
    }
  }, [ageVerified])

  if (ageVerified) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-gray-900 p-8 text-center shadow-2xl">
        <div className="mb-4 flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-3xl font-bold text-white">
            S
          </div>
        </div>

        <h2 id="age-gate-title" className="mb-2 text-xl font-bold text-white">
          {t('headline')}
        </h2>
        <p className="mb-8 text-sm text-gray-400">{t('sub')}</p>

        <div className="flex flex-col gap-3">
          <button
            ref={yesRef}
            onClick={() => setAgeVerified(true)}
            className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 py-3 font-semibold text-white transition-opacity hover:opacity-90"
          >
            {t('yes')}
          </button>
          <button
            onClick={() => (window.location.href = 'https://google.com')}
            className="w-full rounded-xl border border-white/10 py-3 text-sm text-gray-400 transition-colors hover:text-gray-200"
          >
            {t('no')}
          </button>
        </div>
      </div>
    </div>
  )
}
