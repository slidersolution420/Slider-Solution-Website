'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useStore } from '@/store'

const SESSION_KEY = 'exit_shown'

export default function ExitIntentPopup() {
  const t = useTranslations('exit')
  const cart = useStore((s) => s.cart)
  const selectedCountry = useStore((s) => s.selectedCountry)
  const openModal = useStore((s) => s.openModal)
  const [visible, setVisible] = useState(false)

  const enabled = process.env.NEXT_PUBLIC_ENABLE_EXIT_POPUP === 'true'

  useEffect(() => {
    if (!enabled) return

    function shouldShow() {
      return (
        cart.length > 0 &&
        sessionStorage.getItem(SESSION_KEY) !== 'true'
      )
    }

    function show() {
      if (!shouldShow()) return
      sessionStorage.setItem(SESSION_KEY, 'true')
      setVisible(true)
    }

    // Desktop: mouseleave upward
    function onMouseLeave(e: MouseEvent) {
      if (e.clientY <= 0) show()
    }

    // Mobile: 45s idle
    const idleTimer = setTimeout(show, 45000)
    document.addEventListener('mouseleave', onMouseLeave)

    return () => {
      clearTimeout(idleTimer)
      document.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [enabled, cart.length])

  if (!enabled) return null

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0)
  const isIL = selectedCountry === 'IL'

  let subCopy: string
  if (isIL) {
    subCopy = t('sub.israel')
  } else if (totalQty < 3) {
    subCopy = t('sub.intl_under3')
  } else {
    subCopy = t('sub.intl_3plus')
  }

  function handleCTA() {
    openModal('cart')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="exit-popup"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed z-50 w-80 sm:w-[320px] bottom-0 left-0 right-0 sm:bottom-6 sm:right-6 sm:left-auto mx-auto sm:mx-0 rounded-t-xl sm:rounded-xl border border-purple-900/40 p-5 space-y-3"
          style={{ backgroundColor: '#0F1629' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <p className="font-syne font-bold text-white text-base leading-snug">
              {t('headline')}
            </p>
            <button
              onClick={() => setVisible(false)}
              aria-label="Close"
              className="text-gray-500 hover:text-white transition-colors shrink-0"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-400 font-outfit text-sm leading-relaxed">
            {subCopy}
          </p>

          <button onClick={handleCTA} className="btn-purple w-full text-sm py-2.5">
            {t('cta')}
          </button>

          <button
            onClick={() => setVisible(false)}
            className="w-full text-center text-xs font-outfit text-gray-500 hover:text-gray-300 transition-colors"
          >
            {t('dismiss')}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
