'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'

const STORAGE_KEY = 'slider_age_verified'

export default function AgeGate() {
  const t = useTranslations('ageGate')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const verified = localStorage.getItem(STORAGE_KEY)
    if (verified !== 'true') {
      setVisible(true)
    }
  }, [])

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
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col items-center gap-8 px-6 text-center max-w-sm w-full"
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
                onClick={handleYes}
                className="w-full py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-outfit font-semibold text-base transition-colors duration-150"
              >
                {t('yes')}
              </button>
              <button
                onClick={handleNo}
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
