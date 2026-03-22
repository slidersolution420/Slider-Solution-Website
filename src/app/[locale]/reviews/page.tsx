import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { getLocale } from 'next-intl/server'

// ISR — revalidate every hour. Full Supabase wiring in Wave 3.
export const revalidate = 3600

const REVIEWS = [
  {
    id: '1',
    name: 'Matan',
    rating: 5,
    body: 'Amazing product, ordered and arrived quickly. Useful and convenient. Been waiting a long time for something like this.',
    date: 'January 2025',
  },
  {
    id: '2',
    name: 'Em',
    rating: 4,
    body: "Initially had trouble with the grinder. After watching the how-to videos it's crystal clear. Can't imagine rolling without it now.",
    date: 'February 2025',
  },
  {
    id: '3',
    name: 'Dana',
    rating: 5,
    body: 'Perfect kit. Does exactly what it says. The tray is a game changer outdoors.',
    date: 'March 2025',
  },
]

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < rating ? 'text-yellow-400' : 'text-gray-600'}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default async function ReviewsPage() {
  const t = await getTranslations('reviews')
  const locale = await getLocale()

  const avgRating =
    REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length

  return (
    <div className="min-h-screen bg-[#07080F]">
      {/* Hero banner */}
      <div className="bg-[#0F1629] border-b border-white/5 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <div className="text-4xl font-syne font-bold text-white">
            +1K Happy Customers ⭐
          </div>
          <div className="flex items-center justify-center gap-2">
            <Stars rating={Math.round(avgRating)} />
            <span className="text-gray-400 font-outfit text-sm">
              {avgRating.toFixed(1)} / 5.0
            </span>
          </div>
          <h1 className="text-2xl font-syne font-bold text-white">
            {t('page_title')}
          </h1>
          <p className="text-gray-400 font-outfit">{t('page_subtitle')}</p>
        </div>
      </div>

      {/* Review grid */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              className="bg-[#0F1629] rounded-2xl border border-white/5 p-6 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-syne font-bold text-white">{review.name}</p>
                <Stars rating={review.rating} />
              </div>
              <blockquote className="text-gray-300 font-outfit text-sm leading-relaxed">
                &ldquo;{review.body}&rdquo;
              </blockquote>
              <div className="flex items-center justify-between text-xs font-outfit text-gray-500">
                <span>{t('verified')}</span>
                <span>{review.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Back link */}
        <div className="mt-10 text-center">
          <Link
            href={`/${locale}`}
            className="text-purple-400 hover:text-purple-300 font-outfit text-sm transition-colors"
          >
            ← Back to shop
          </Link>
        </div>
      </div>
    </div>
  )
}
