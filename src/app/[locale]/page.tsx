import type { Metadata } from 'next'
import ClientOnly from '@/components/ui/ClientOnly'
import AgeGate from '@/components/ui/AgeGate'
import NavBar from '@/components/ui/NavBar'
import ProductHero from '@/components/product/ProductHero'
import TickerBar from '@/components/ui/TickerBar'
import KitFeatures from '@/components/product/KitFeatures'
import HowItWorks from '@/components/product/HowItWorks'
import ReviewsCarousel from '@/components/ui/ReviewsCarousel'
import BuyNowSection from '@/components/product/BuyNowSection'
import Footer from '@/components/ui/Footer'
import CartDrawer from '@/components/checkout/CartDrawer'
import StickyCartBar from '@/components/ui/StickyCartBar'
import ExitIntentPopup from '@/components/ui/ExitIntentPopup'
import WholesaleModal from '@/components/wholesale/WholesaleModal'

// ─── Per-locale SEO metadata ──────────────────────────────────────────────────

const titles: Record<string, string> = {
  en: 'Slider Cone Kit — The Original All-in-One | Slider Solution',
  he: 'ערכת הקונוס של Slider — הכל-באחד המקורי | Slider Solution',
  es: 'Kit de Cono Slider — El Todo-en-Uno Original | Slider Solution',
}

const descriptions: Record<string, string> = {
  en: 'The premium all-in-one cone kit. Square grinder, wind-protected tray, funnel, and cones. Patent protected. Ships worldwide. $25.',
  he: 'ערכת הקונוס הפרימיום הכל-באחד. מטחנה מרובעת, מגש מוגן מרוח, משפך וקונוסים. מוגן בפטנט. משלוח לכל העולם.',
  es: 'El kit de cono premium todo-en-uno. Molinillo cuadrado, bandeja protegida del viento, embudo y conos. Protección de patente. Envío mundial. $25.',
}

const ogLocales: Record<string, string> = {
  en: 'en_US',
  he: 'he_IL',
  es: 'es_ES',
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const locale = params.locale
  const title = titles[locale] ?? titles['en']
  const description = descriptions[locale] ?? descriptions['en']
  const ogLocale = ogLocales[locale] ?? 'en_US'

  return {
    title,
    description,
    alternates: {
      canonical: `https://slidersolution.com/${locale}`,
      languages: {
        en: 'https://slidersolution.com/en',
        he: 'https://slidersolution.com/he',
        es: 'https://slidersolution.com/es',
      },
    },
    openGraph: {
      title,
      description,
      url: `https://slidersolution.com/${locale}`,
      siteName: 'Slider Solution',
      images: [
        {
          url: 'https://slidersolution.com/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Slider Cone Kit',
        },
      ],
      locale: ogLocale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://slidersolution.com/og-image.jpg'],
    },
  }
}

// ─── JSON-LD product schema ───────────────────────────────────────────────────

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Slider Cone Kit',
  description:
    'Premium all-in-one cone kit — square grinder, wind-protected tray, funnel, and cones.',
  brand: { '@type': 'Brand', name: 'Slider Solution' },
  offers: {
    '@type': 'Offer',
    price: '25.00',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: 'https://slidersolution.com/en',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '1000',
  },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      {/* JSON-LD product schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Age gate — checks localStorage, only shows on first visit */}
      <ClientOnly>
        <AgeGate />
      </ClientOnly>

      {/* Main layout */}
      <NavBar />

      <main>
        <ProductHero />
        <TickerBar />
        <KitFeatures />
        <HowItWorks />
        <ReviewsCarousel />
        <BuyNowSection />
      </main>

      <Footer />

      {/* Overlays */}
      <ClientOnly>
        <CartDrawer />
        <StickyCartBar />
        <ExitIntentPopup />
        <WholesaleModal />
      </ClientOnly>
    </>
  )
}
