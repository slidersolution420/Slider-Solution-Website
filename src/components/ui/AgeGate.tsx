'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'

const STORAGE_KEY = 'slider_age_verified'

export default function AgeGate() {
  const t = useTranslations('ageGate')
  const [visible, setVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const yesRef = useRef<HTMLButtonElement>(null)
  const noRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const verified = localStorage.getItem(STORAGE_KEY)
    if (verified !== 'true') {
      setVisible(true)
    }
  }, [])

  // Move focus into the dialog when it opens
  useEffect(() => {
    if (visible) {
      setTimeout(() => containerRef.current?.focus(), 50)
    }
  }, [visible])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'Tab') return
    const focusable = [yesRef.current, noRef.current].filter(
      (el): el is HTMLButtonElement => el !== null,
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) return
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  function handleYes() {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
  }

  function handleNo() {
    window.location.href = 'https://google.com'
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="age-gate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backgroundColor: '#000000' }}
        >
          <motion.div
            ref={containerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={t('headline')}
            onKeyDown={handleKeyDown}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col items-center gap-8 px-6 text-center max-w-sm w-full focus:outline-none"
          >
            {/* Logo */}
            <div className="tracking-[0.35em] text-3xl font-syne font-bold text-white uppercase select-none">
              S L I D E R
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-xl font-syne font-bold text-white leading-snug">
                {t('headline')}
              </h1>
              <p className="text-gray-400 font-outfit text-base">{t('sub')}</p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 w-full">
              <button
                ref={yesRef}
                onClick={handleYes}
                className="w-full py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-outfit font-semibold text-base transition-colors duration-150"
              >
                {t('yes')}
              </button>
              <button
                ref={noRef}
                onClick={handleNo}
                aria-label="I am under 21, exit site"
                className="w-full py-3 rounded-full border border-white/30 text-white hover:border-white/60 font-outfit font-medium text-base transition-colors duration-150"
              >
                {t('no')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
