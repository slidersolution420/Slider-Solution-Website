'use client'

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

export default function HomePage() {
  return (
    <>
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
