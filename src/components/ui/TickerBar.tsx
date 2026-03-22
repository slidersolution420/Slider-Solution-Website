'use client'

import { useTranslations } from 'next-intl'

// Pure CSS marquee — zero JavaScript animation, zero Framer Motion.
// Content is doubled so the loop is seamless.
export default function TickerBar() {
  const t = useTranslations('ticker')
  const text = t('text')

  return (
    <div
      className="overflow-hidden bg-[#0F1629] border-y border-white/5 py-3 select-none"
      aria-hidden="true"
    >
      {/* Double the content for seamless loop */}
      <div
        className="ticker-track flex whitespace-nowrap"
        style={{ width: 'max-content' }}
      >
        {[0, 1].map((i) => (
          <span
            key={i}
            className="inline-flex items-center gap-8 px-8 font-outfit font-medium text-sm uppercase tracking-widest text-gray-400"
          >
            {text}
            <span className="text-purple-600 text-xs mx-4">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}
