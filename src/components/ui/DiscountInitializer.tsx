'use client'

import { useEffect } from 'react'
import { useStore } from '@/store'

/**
 * Syncs the server-provided discount percentage into the Zustand store
 * so client components (CartDrawer, etc.) can read it without prop drilling.
 * The value is NOT persisted — it always comes fresh from the server on each page load.
 */
export default function DiscountInitializer({ discountPct }: { discountPct: number }) {
  const setDiscountPct = useStore((s) => s.setDiscountPct)
  useEffect(() => {
    setDiscountPct(discountPct)
  }, [discountPct, setDiscountPct])
  return null
}
