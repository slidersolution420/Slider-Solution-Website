'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import type { Review } from '@/lib/types'

interface ReviewsCarouselProps {
  reviews: Review[]
  locale: string
}

export default function ReviewsCarousel({ reviews, locale }: ReviewsCarouselProps) {
  const t = useTranslations('reviews_carousel')
  const [index, setIndex] = useState(0)
  const isRtl = locale === 'he'

  if (reviews.length === 0) return null

  const review = reviews[index]!

  function prev() {
    setIndex((i) => (i === 0 ? reviews.length - 1 : i - 1))
  }

  function next() {
    setIndex((i) => (i === reviews.length - 1 ? 0 : i + 1))
  }

  return (
    <section className="bg-gray-900/30 py-20">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-white">
            {t('title')}
          </h2>
        </div>

        <div className="relative rounded-2xl border border-white/10 bg-gray-900 p-8 md:p-12">
          {/* Stars */}
          <div className="mb-4 flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                className={`size-5 ${i < (review.rating ?? 5) ? 'text-yellow-400' : 'text-gray-700'}`}
              />
            ))}
          </div>

          {/* Review text */}
          <blockquote className="mb-6 text-lg leading-relaxed text-gray-200 md:text-xl">
            &ldquo;{review.body}&rdquo;
          </blockquote>

          {/* Author */}
          <p className="font-semibold text-white">{review.name}</p>

          {/* Navigation */}
          {reviews.length > 1 && (
            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={isRtl ? next : prev}
                className="flex size-9 items-center justify-center rounded-full border border-white/20 text-gray-400 transition-colors hover:border-white/40 hover:text-white"
                aria-label="Previous review"
              >
                <ChevronLeftIcon className="size-4" />
              </button>
              <span className="text-sm text-gray-500">
                {index + 1} / {reviews.length}
              </span>
              <button
                onClick={isRtl ? prev : next}
                className="flex size-9 items-center justify-center rounded-full border border-white/20 text-gray-400 transition-colors hover:border-white/40 hover:text-white"
                aria-label="Next review"
              >
                <ChevronRightIcon className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
