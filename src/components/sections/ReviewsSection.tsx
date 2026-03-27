'use client'

import { useState } from 'react'
import { StarIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { useTranslations } from 'next-intl'
import type { Review } from '@/lib/types'

interface ReviewsSectionProps {
  reviews: Review[]
  locale: string
}

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'size-7' : 'size-4'
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={`${cls} ${i < rating ? 'text-amber-400' : 'text-gray-700'}`}
        />
      ))}
    </div>
  )
}

function averageRating(reviews: Review[]) {
  if (reviews.length === 0) return 0
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
}

export default function ReviewsSection({ reviews, locale }: ReviewsSectionProps) {
  const t = useTranslations('reviews')
  const isRtl = locale === 'he'
  const avg = averageRating(reviews)
  const [open, setOpen] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function openModal() {
    setName('')
    setRating(0)
    setHoverRating(0)
    setBody('')
    setSubmitting(false)
    setSuccess(false)
    setError('')
    setOpen(true)
  }

  function closeModal() {
    setOpen(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim() || name.trim().length < 2) {
      setError(t('form_name'))
      return
    }
    if (rating < 1) {
      setError(t('form_rating'))
      return
    }
    if (!body.trim() || body.trim().length < 10) {
      setError(t('form_body'))
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), rating, body: body.trim() }),
      })
      if (!res.ok) throw new Error('failed')
      setSuccess(true)
    } catch {
      setError(t('form_submit'))
    } finally {
      setSubmitting(false)
    }
  }

  const displayRating = hoverRating || rating

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .review-card {
          opacity: 0;
          animation: fadeUp 0.5s ease forwards;
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
        .check-anim {
          animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      <section
        dir={isRtl ? 'rtl' : 'ltr'}
        className="relative overflow-hidden bg-gray-950 py-24"
      >
        {/* Subtle ambient glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4">
          {/* Header */}
          <div className="mb-14 text-center">
            {reviews.length > 0 && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`size-3.5 ${i < Math.round(avg) ? 'text-amber-400' : 'text-gray-600'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-amber-400">
                  {avg.toFixed(1)}
                </span>
                <span className="text-sm text-gray-400">
                  · {t('rating_summary', { count: reviews.length })}
                </span>
              </div>
            )}

            <h2 className="mb-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
              {t('title')}
            </h2>
            <p className="text-lg text-gray-400">{t('subtitle')}</p>
          </div>

          {/* Grid */}
          {reviews.length > 0 ? (
            <div className="mb-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review, i) => (
                <div
                  key={review.id}
                  className="review-card group relative flex flex-col rounded-2xl border border-white/10 bg-gray-900 p-6 transition-colors duration-300 hover:border-amber-400/20"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Decorative quote */}
                  <span
                    className={`absolute top-4 ${isRtl ? 'left-5' : 'right-5'} font-serif text-5xl leading-none text-amber-400/15 select-none`}
                    aria-hidden
                  >
                    &ldquo;
                  </span>

                  <StarRow rating={review.rating} />

                  <p className="mt-4 flex-1 text-base italic leading-relaxed text-gray-300">
                    &ldquo;{review.body}&rdquo;
                  </p>

                  <div className="mt-5 flex items-center gap-2">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-400/10 text-sm font-bold text-amber-400">
                      {review.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-white">{review.name}</span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                      {t('verified')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-12 rounded-2xl border border-dashed border-white/10 py-16 text-center">
              <p className="text-gray-500">{t('empty')}</p>
            </div>
          )}

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-8 py-3.5 text-sm font-bold text-gray-950 shadow-lg shadow-amber-500/20 transition-all duration-200 hover:scale-105 hover:shadow-amber-500/40 active:scale-95"
            >
              <StarIcon className="size-4" />
              {t('leave_review')}
            </button>
          </div>
        </div>
      </section>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className="relative mx-4 w-full max-w-lg rounded-2xl border border-white/10 bg-gray-900 p-8 shadow-2xl"
          >
            {/* Close */}
            <button
              onClick={closeModal}
              className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} flex size-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white/10 hover:text-white`}
              aria-label={t('form_close')}
            >
              <XMarkIcon className="size-5" />
            </button>

            {success ? (
              <div className="py-6 text-center">
                <div className="check-anim mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
                  <svg className="size-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">{t('form_success_title')}</h3>
                <p className="text-gray-400">{t('form_success_body')}</p>
                <button
                  onClick={closeModal}
                  className="mt-6 rounded-full border border-white/20 px-6 py-2 text-sm text-gray-300 transition-colors hover:border-white/40 hover:text-white"
                >
                  {t('form_close')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h3 className="mb-6 text-xl font-bold text-white">{t('form_title')}</h3>

                {/* Name */}
                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">
                    {t('form_name')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('form_name')}
                    className="w-full rounded-xl border border-white/20 bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
                  />
                </div>

                {/* Star picker */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    {t('form_rating')}
                  </label>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const val = i + 1
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setRating(val)}
                          onMouseEnter={() => setHoverRating(val)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform duration-100 hover:scale-110 active:scale-95"
                          aria-label={`${val} star${val !== 1 ? 's' : ''}`}
                        >
                          <StarIcon
                            className={`size-9 transition-colors ${val <= displayRating ? 'text-amber-400' : 'text-gray-700'}`}
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Body */}
                <div className="mb-6">
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">
                    {t('form_body')}
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={t('form_body')}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-white/20 bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
                  />
                </div>

                {error && (
                  <p className="mb-4 text-sm text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 py-3.5 text-sm font-bold text-gray-950 shadow-lg shadow-amber-500/20 transition-all duration-200 hover:shadow-amber-500/40 disabled:opacity-60"
                >
                  {submitting ? t('form_submitting') : t('form_submit')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
