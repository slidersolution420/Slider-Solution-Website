import type { Metadata } from 'next'
import { getProduct, getSiteSettings, getFaq } from '@/lib/keystatic'
import { createServiceClient } from '@/lib/supabase-server'
import type { Review } from '@/lib/types'
import NavBar from '@/components/ui/NavBar'
import AgeGate from '@/components/ui/AgeGate'
import CartDrawer from '@/components/ui/CartDrawer'
import Footer from '@/components/ui/Footer'
import StickyCartBar from '@/components/ui/StickyCartBar'
import HeroSection from '@/components/sections/HeroSection'
import TickerBar from '@/components/sections/TickerBar'
import FeaturesGrid from '@/components/sections/FeaturesGrid'
import HowItWorks from '@/components/sections/HowItWorks'
import ReviewsCarousel from '@/components/sections/ReviewsCarousel'
import FaqAccordion from '@/components/sections/FaqAccordion'
import TrustBar from '@/components/sections/TrustBar'
import { isRtl } from '@/i18n/routing'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params
  const isHe = locale === 'he'

  return {
    title: isHe ? 'SLIDER — קיט הגלגול המושלם' : 'SLIDER — The Original All-in-One Cone Kit',
    description: isHe
      ? 'קיט ה-ALL IN ONE הראשון בעולם. מטחנה מרובעת, משפך מובנה, 5 קונוסים. משלוח חינם בכל הארץ.'
      : "The world's first ALL IN ONE cone kit. Square grinder, built-in funnel, 5 cones. Free shipping.",
    openGraph: {
      images: ['/og-image.jpg'],
    },
  }
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params

  // Fetch all data in parallel
  const [product, siteSettings, faqItems] = await Promise.all([
    getProduct(),
    getSiteSettings(),
    getFaq(),
  ])

  let reviews: Review[] = []
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(10)
    reviews = (data ?? []) as Review[]
  } catch {
    // Service client unavailable (e.g. missing env var in preview) — show no reviews
  }

  const tickerText = locale === 'he' ? siteSettings.ticker_he : siteSettings.ticker_en

  return (
    <>
      <AgeGate />
      <NavBar />
      <CartDrawer />

      <main>
        {/* JSON-LD Product Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: 'SLIDER Cone Kit',
              description: locale === 'he' ? product.description_he : product.description_en,
              brand: { '@type': 'Brand', name: 'Slider Solution' },
              offers: {
                '@type': 'Offer',
                price: product.price_b2c_usd,
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
                url: process.env.NEXT_PUBLIC_APP_URL,
              },
            }),
          }}
        />

        <HeroSection product={product} locale={locale} />

        {tickerText && <TickerBar text={tickerText} rtl={isRtl(locale)} />}

        <TrustBar />

        <FeaturesGrid product={product} locale={locale} />

        <HowItWorks product={product} locale={locale} />

        {reviews.length > 0 && (
          <ReviewsCarousel reviews={reviews} locale={locale} />
        )}

        <FaqAccordion items={faqItems} locale={locale} />
      </main>

      <Footer />
      <StickyCartBar />
    </>
  )
}

export const revalidate = 3600 // Revalidate reviews every hour
