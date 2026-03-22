'use client'

import { useEffect, useState } from 'react'

/**
 * Renders children only after client-side hydration.
 * Use to wrap components that depend on localStorage/sessionStorage
 * or Zustand persisted state, preventing SSR hydration mismatches.
 */
export default function ClientOnly({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  return <>{children}</>
}
