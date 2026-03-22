'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useInView } from '@/hooks/useInView'

const STEPS = [1, 2, 3] as const

const STEP_COLORS = ['from-purple-900 to-purple-700', 'from-blue-900 to-blue-700', 'from-purple-900 to-purple-600'] as const

export default function HowItWorks() {
  const t = useTranslations('howto')
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.1 })

  return (
    <section className="py-20 bg-[#0F1629]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <div className="text-center mb-16 space-y-2">
          <h2 className="text-3xl md:text-4xl font-syne font-bold text-white">
            {t('title')}
          </h2>
          <p className="text-gray-400 font-outfit">{t('subtitle')}</p>
        </div>

        {/* Steps */}
        <div ref={ref} className="relative">
          {/* Connecting line — desktop */}
          <div className="hidden md:block absolute top-16 left-[calc(16.67%)] right-[calc(16.67%)] h-px bg-gradient-to-r from-purple-600/40 via-purple-500/60 to-purple-600/40" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {STEPS.map((step, index) => (
              <motion.div
                key={step}
                initial={{ y: 30, opacity: 0 }}
                animate={
                  isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }
                }
                transition={{
                  duration: 0.5,
                  ease: 'easeOut',
                  delay: index * 0.2,
                }}
                className="flex flex-col items-center text-center gap-6"
              >
                {/* GIF placeholder */}
                <div
                  className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${STEP_COLORS[index]} flex items-center justify-center relative z-10`}
                >
                  <span className="text-5xl font-syne font-bold text-white/30">
                    {step}
                  </span>
                </div>

                {/* Step number */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-syne font-bold text-purple-500 leading-none">
                      0{step}
                    </span>
                    <h3 className="text-xl font-syne font-bold text-white">
                      {t(`step${step}_title` as Parameters<typeof t>[0])}
                    </h3>
                  </div>
                  <p className="text-gray-400 font-outfit text-sm leading-relaxed max-w-xs mx-auto">
                    {t(`step${step}_desc` as Parameters<typeof t>[0])}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
