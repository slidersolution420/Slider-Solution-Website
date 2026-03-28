'use client'

import { useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useStore } from '@/store'
import { localeConfig } from '@/i18n/routing'
import type { Locale } from '@/i18n/routing'

export default function CurrencyInitializer() {
  const locale = useLocale()
  const setCurrency = useStore((s) => s.setCurrency)

  useEffect(() => {
    const hasPersistedCart = Boolean(localStorage.getItem('slider-cart'))
    if (!hasPersistedCart) {
      setCurrency(localeConfig[locale as Locale].currency)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
