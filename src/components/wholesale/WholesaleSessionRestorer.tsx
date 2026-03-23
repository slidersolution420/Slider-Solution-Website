'use client'

import { useEffect } from 'react'
import { useStore } from '@/store'
import { checkWholesaleSession } from '@/lib/auth'

export function WholesaleSessionRestorer() {
  const setIsWholesaleUser = useStore((s) => s.setIsWholesaleUser)

  useEffect(() => {
    checkWholesaleSession().then((account) => {
      if (account) setIsWholesaleUser(true)
    })
  }, [setIsWholesaleUser])

  return null
}
