'use client'

import { useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useStore } from '@/store'

export default function CurrencyInitializer() {
  const locale = useLocale()
  const setCurrency = useStore((s) => s.setCurrency)

  useEffect(() => {
    const hasPersistedCart = Boolean(localStorage.getItem('slider-cart'))
    if (!hasPersistedCart) {
      setCurrency(locale === 'he' ? 'ILS' : 'USD')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
