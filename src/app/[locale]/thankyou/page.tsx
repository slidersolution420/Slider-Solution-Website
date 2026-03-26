'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'

function ThankYouContent() {
  const t = useTranslations('success')
  const locale = useLocale()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })

    if (!params['Order']) {
      setStatus('error')
      return
    }

    fetch('/api/checkout/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
      .then(r => r.json() as Promise<{ success?: boolean; order_id?: string; error?: string }>)
      .then(data => {
        if (data.success) {
          setOrderId(data.order_id ?? null)
          setStatus('success')
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [searchParams])

  const homeHref = locale === 'he' ? '/' : `/${locale}`

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-0)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-surface-5)]">{t('verifying')}</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-0)] px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">{t('errorTitle')}</h1>
          <p className="text-[var(--color-surface-5)] mb-6">{t('errorBody')}</p>
          <Link href={homeHref} className="btn-primary">
            {t('backHome')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-0)] px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-white mb-3">{t('title')}</h1>
        <p className="text-[var(--color-surface-5)] mb-3">{t('body')}</p>
        {orderId && (
          <p className="text-sm text-[var(--color-surface-4)] mb-6">
            {t('orderRef')}:{' '}
            <span className="font-mono text-white">{orderId.slice(0, 8).toUpperCase()}</span>
          </p>
        )}
        <Link href={homeHref} className="btn-primary">
          {t('backHome')}
        </Link>
      </div>
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-0)]">
          <div className="w-12 h-12 border-4 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  )
}
