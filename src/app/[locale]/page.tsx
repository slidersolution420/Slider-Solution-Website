import type { Metadata } from 'next'
import { getProduct, getFaq } from '@/lib/keystatic'
import { getConfig } from '@/lib/config'
import { createServiceClient } from '@/lib/supabase-server'
import type { Review } from '@/lib/types'
import NavBar from '@/components/ui/NavBar'
import AgeGate from '@/components/ui/AgeGate'
import CartDrawer from '@/components/ui/CartDrawer'
import Footer from '@/components/ui/Footer'
import StickyCartBar from '@/components/ui/StickyCartBar'
import ShippingBanner from '@/components/ui/ShippingBanner'
import HeroSection from '@/components/sections/HeroSection'
import TickerBar from '@/components/sections/TickerBar'
import FeaturesGrid from '@/components/sections/FeaturesGrid'
import HowItWorks from '@/components/sections/HowItWorks'
import ReviewsSection from '@/components/sections/ReviewsSection'
import FaqAccordion from '@/components/sections/FaqAccordion'
import InstagramReels from '@/components/sections/InstagramReels'
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
  const [product, siteConfig, faqItems] = await Promise.all([
    getProduct(),
    getConfig(),
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

  const tickerText = locale === 'he' ? siteConfig.ticker_he : siteConfig.ticker_en

  return (
    <>
      <AgeGate />
      <NavBar />
      <ShippingBanner />
      <CartDrawer />

      <main className="pb-24 md:pb-0">
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

        <HeroSection product={product} locale={locale} visibleColors={siteConfig.visible_colors} />

        {siteConfig.ticker_enabled && tickerText && <TickerBar text={tickerText} rtl={isRtl(locale)} />}

        <HowItWorks locale={locale} />

        <FeaturesGrid product={product} locale={locale} />

        <ReviewsSection reviews={reviews} locale={locale} />

        <InstagramReels locale={locale} />

        <FaqAccordion items={faqItems} locale={locale} />
      </main>

      <Footer />
      <StickyCartBar product={product} locale={locale} />
    </>
  )
}

export const revalidate = 3600 // Revalidate reviews every hour
