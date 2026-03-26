'use client'

import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import type { FaqItem } from '@/lib/keystatic'

interface FaqAccordionProps {
  items: FaqItem[]
  locale: string
}

export default function FaqAccordion({ items, locale }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white">
            {locale === 'he' ? 'שאלות נפוצות' : 'Frequently Asked Questions'}
          </h2>
        </div>

        <div className="space-y-3">
          {items.map((item, i) => {
            const question = locale === 'he' ? item.question_he : item.question_en
            const answer = locale === 'he' ? item.answer_he : item.answer_en
            const isOpen = openIndex === i

            return (
              <div
                key={item.slug}
                className={`overflow-hidden rounded-xl border transition-colors ${
                  isOpen ? 'border-brand-700/60 bg-brand-900/20' : 'border-white/10 bg-gray-900/50'
                }`}
              >
                <button
                  className="flex w-full items-center justify-between px-5 py-4 text-start"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-white">{question}</span>
                  <ChevronDownIcon
                    className={`size-5 shrink-0 text-gray-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-brand-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-4">
                    <p className="text-sm leading-relaxed text-gray-400">{answer}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
