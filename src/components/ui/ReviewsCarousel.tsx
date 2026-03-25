'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { StarIcon } from '@heroicons/react/24/solid'
import { useInView } from '@/hooks/useInView'

export interface ReviewItem {
  id: string
  name: string
  rating: number
  body: string
  created_at: string
}

interface Props {
  reviews: ReviewItem[]
}

export default function ReviewsCarousel({ reviews }: Props) {
  const t = useTranslations('reviews')
  const locale = useLocale()
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [sectionRef, isInView] = useInView<HTMLDivElement>({ threshold: 0.1 })
  const dragStartX = useRef(0)

  const count = reviews.length || 1

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % count)
  }, [count])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + count) % count)
  }, [count])

  // Auto-advance every 5s
  useEffect(() => {
    if (paused) return
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [paused, next])

  // Pointer-based swipe
  function onPointerDown(e: React.PointerEvent) {
    dragStartX.current = e.clientX
    setPaused(true)
  }

  function onPointerUp(e: React.PointerEvent) {
    const delta = e.clientX - dragStartX.current
    if (delta < -50) next()
    else if (delta > 50) prev()
    setPaused(false)
  }

  const review = reviews[current]
  const displayDate = review
    ? new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : ''

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="py-20 bg-[#07080F]"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-3xl md:text-4xl font-syne font-bold text-white">
            {t('title')}
          </h2>
          <p className="text-gray-400 font-outfit">{t('subtitle')}</p>
        </div>

        {/* Carousel */}
        <div
          className="relative select-none"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="card-surface p-8 text-center space-y-4"
            >
              {/* Stars */}
              <div className="flex justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-5 h-5 ${
                      review && i < review.rating
                        ? 'text-yellow-400'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>

              <blockquote className="text-white font-outfit text-lg leading-relaxed">
                &ldquo;{review?.body}&rdquo;
              </blockquote>

              <div className="space-y-0.5">
                <p className="font-syne font-bold text-white">{review?.name}</p>
                <p className="text-xs font-outfit text-gray-500">
                  {t('verified')} · {displayDate}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrent(i)
                setPaused(true)
                setTimeout(() => setPaused(false), 5000)
              }}
              aria-label={`Review ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                i === current ? 'bg-purple-500 w-4' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* See all link */}
        <div className="text-center mt-8">
          <Link
            href={`/${locale}/reviews`}
            className="text-purple-400 hover:text-purple-300 font-outfit text-sm transition-colors"
          >
            {t('see_all')}
          </Link>
        </div>
      </div>
    </motion.section>
  )
}
