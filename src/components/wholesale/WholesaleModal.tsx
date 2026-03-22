'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useStore } from '@/store'

type Tab = 'login' | 'signup'

export default function WholesaleModal() {
  const t = useTranslations('wholesale')
  const modals = useStore((s) => s.modals)
  const closeModal = useStore((s) => s.closeModal)
  const [activeTab, setActiveTab] = useState<Tab>('login')

  const isOpen = modals.wholesale

  // Escape key + scroll lock
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal('wholesale')
    }
    if (isOpen) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeModal])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="wholesale-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeModal('wholesale')}
            className="fixed inset-0 bg-black/60 z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="wholesale-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-md bg-[#0F1629] rounded-2xl border border-white/10 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                <h2 className="font-syne font-bold text-lg text-white">
                  {t('modal_title')}
                </h2>
                <button
                  onClick={() => closeModal('wholesale')}
                  aria-label="Close"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/5">
                {(['login', 'signup'] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-sm font-outfit font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-white border-b-2 border-purple-500'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {tab === 'login' ? t('tab_login') : t('tab_signup')}
                  </button>
                ))}
              </div>

              {/* Body — placeholder for Wave 4 */}
              <div className="px-6 py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-600/15 flex items-center justify-center mx-auto">
                  <span className="text-2xl">🏪</span>
                </div>
                <p className="text-gray-400 font-outfit text-sm">
                  {t('placeholder')}
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
