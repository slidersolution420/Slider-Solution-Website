import { getTranslations, getLocale } from 'next-intl/server'
import Link from 'next/link'
import { StarIcon } from '@heroicons/react/24/solid'
import NavBar from '@/components/ui/NavBar'
import Footer from '@/components/ui/Footer'
import { createClient } from '@/lib/supabase-server'
import type { ReviewItem } from '@/components/ui/ReviewsCarousel'

// ISR — revalidate every hour
export const revalidate = 3600

async function getApprovedReviews(): Promise<ReviewItem[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('reviews')
      .select('id, name, rating, body, created_at')
      .eq('approved', true)
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data as ReviewItem[]
  } catch {
    return []
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`}
        />
      ))}
    </div>
  )
}

export default async function ReviewsPage() {
  const t = await getTranslations('reviews')
  const locale = await getLocale()
  const reviews = await getApprovedReviews()

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 4.9

  return (
    <>
      <NavBar />

      <div className="min-h-screen bg-[#07080F]">
        {/* Hero banner */}
        <div className="bg-[#0F1629] border-b border-white/5 pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
            <div className="text-4xl font-syne font-bold text-white">
              {t('hero_banner')}
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
          {reviews.length === 0 ? (
            <p className="text-center text-gray-500 font-outfit">{t('empty')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review) => {
                const date = new Date(review.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })
                return (
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
                      <span>{date}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Back link */}
          <div className="mt-10 text-center">
            <Link
              href={`/${locale}`}
              className="text-purple-400 hover:text-purple-300 font-outfit text-sm transition-colors"
            >
              {t('back_to_shop')}
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
