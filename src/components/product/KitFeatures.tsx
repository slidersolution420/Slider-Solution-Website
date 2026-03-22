'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import {
  CubeIcon,
  ShieldCheckIcon,
  FunnelIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline'
import { useInView } from '@/hooks/useInView'

const FEATURES = [
  { key: 'grinder', Icon: CubeIcon },
  { key: 'tray', Icon: ShieldCheckIcon },
  { key: 'funnel', Icon: FunnelIcon },
  { key: 'storage', Icon: ArchiveBoxIcon },
] as const

export default function KitFeatures() {
  const t = useTranslations('features')
  const [sectionRef, isInView] = useInView<HTMLDivElement>({ threshold: 0.1 })

  return (
    <section className="py-20 bg-[#07080F]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-3xl md:text-4xl font-syne font-bold text-white">
            {t('title')}
          </h2>
          <p className="text-gray-400 font-outfit">{t('subtitle')}</p>
        </div>

        {/* Cards grid */}
        <div
          ref={sectionRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {FEATURES.map(({ key, Icon }, index) => (
            <motion.div
              key={key}
              initial={{ y: 30, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
              transition={{
                duration: 0.5,
                ease: 'easeOut',
                delay: index * 0.15,
              }}
              className="card-surface p-6 space-y-4 hover:border-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-600/15 flex items-center justify-center">
                <Icon className="w-5 h-5 text-purple-400" />
              </div>
              <div className="space-y-1">
                <h3 className="font-syne font-bold text-white text-base">
                  {t(`${key}_title` as Parameters<typeof t>[0])}
                </h3>
                <p className="text-sm font-outfit text-gray-400 leading-relaxed">
                  {t(`${key}_desc` as Parameters<typeof t>[0])}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
