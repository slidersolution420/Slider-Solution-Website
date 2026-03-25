'use client'

import { useEffect } from 'react'
import { useStore } from '@/store'
import { trackPurchase } from '@/lib/analytics'
import type { Currency } from '@/lib/types'

interface Props {
  orderId: string
  totalUsd: number
  currency: Currency
  shippingCountry?: string
}

export default function PurchaseTracker({
  orderId,
  totalUsd,
  currency,
}: Props) {
  const clearCart = useStore((s) => s.clearCart)

  useEffect(() => {
    // 1. Clear cart
    clearCart()

    // 2. Fire trackPurchase only once per session per order
    const key = `purchase_tracked_${orderId}`
    if (!sessionStorage.getItem(key)) {
      trackPurchase(orderId, totalUsd, currency)
      sessionStorage.setItem(key, 'true')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
