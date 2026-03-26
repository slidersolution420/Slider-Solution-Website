'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useStore } from '@/store'
import { B2C_PRICE_USD } from '@/lib/currency'
import { formatPrice } from '@/lib/currency'
import {
  TruckIcon,
  UserGroupIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/solid'
import type { ProductContent } from '@/lib/keystatic'

interface HeroSectionProps {
  product: ProductContent
  locale: string
}

const SUPABASE_STORAGE = `https://ecuhecmfxfavjdxuctkg.supabase.co/storage/v1/object/public/product-images`
const PURPLE_VIDEO_URL = `${SUPABASE_STORAGE}/kit-purple-animation.mp4`

export default function HeroSection({ product, locale }: HeroSectionProps) {
  const t = useTranslations('hero')
  const { addItem, openCart, selectedColor, setSelectedColor, selectedQty, setSelectedQty, currency } =
    useStore()

  const tagline = locale === 'he' ? product.tagline_he : product.tagline_en
  const description = locale === 'he' ? product.description_he : product.description_en

  const badges = [
    { text: t('badge_shipping'), icon: TruckIcon, gold: false },
    { text: t('badge_customers'), icon: UserGroupIcon, gold: false },
    { text: t('badge_patent'), icon: ShieldCheckIcon, gold: true },
  ]

  const selectedColorData = product.colors?.find((c) => c.slug === selectedColor) ?? product.colors?.[0]

  const imageUrl = selectedColorData?.image
    ? `${SUPABASE_STORAGE}/${selectedColorData.image}`
    : null

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || selectedColor !== 'purple') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !video.src) {
          video.src = PURPLE_VIDEO_URL
          video.load()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [selectedColor])

  function handleAddToCart() {
    if (!selectedColorData) return
    addItem({
      productId: 'slider-cone-kit',
      color: selectedColorData.slug,
      quantity: selectedQty,
      priceUsd: B2C_PRICE_USD,
      name: `${product.name} — ${locale === 'he' ? selectedColorData.name_he : selectedColorData.name_en}`,
    })
    openCart()
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-surface pt-24 pb-16">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-1/4 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-brand-900/30 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text side */}
          <div>
            {/* Eyebrow */}
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-400">
              {product.name}
            </p>

            {/* Headline */}
            <h1 className="mb-4 text-5xl font-black leading-[1.1] text-white md:text-6xl lg:text-7xl">
              {tagline}
            </h1>

            {/* Subtitle */}
            <p className="mb-8 text-lg leading-relaxed text-gray-300">
              {description}
            </p>

            {/* Badges */}
            <div className="mb-8 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={badge.text}
                  className={
                    badge.gold
                      ? 'flex items-center gap-2 rounded-full border border-amber-500/50 bg-amber-900/20 px-4 py-2 text-sm font-bold text-amber-300 transition-colors hover:border-amber-400/60 hover:bg-amber-900/30'
                      : 'flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:border-white/25 hover:bg-white/12'
                  }
                >
                  <badge.icon className={`size-3.5 ${badge.gold ? 'text-amber-400' : 'text-brand-400'}`} />
                  {badge.text}
                </span>
              ))}
            </div>

            {/* Color selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <p className="mb-2 text-sm text-gray-400">
                  {locale === 'he' ? 'צבע' : 'Color'}:{' '}
                  <span className="font-medium text-white">
                    {locale === 'he' ? selectedColorData?.name_he : selectedColorData?.name_en}
                  </span>
                </p>
                <div className="flex gap-3" role="radiogroup">
                  {product.colors.map((color) => (
                    <button
                      key={color.slug}
                      role="radio"
                      aria-checked={selectedColor === color.slug}
                      onClick={() => setSelectedColor(color.slug)}
                      className={`h-8 w-8 rounded-full border-2 bg-gradient-to-br transition-all ${color.gradient} ${
                        selectedColor === color.slug
                          ? 'border-brand-400 scale-110 ring-2 ring-brand-500/50'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      aria-label={locale === 'he' ? color.name_he : color.name_en}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <p className="mb-2 text-sm text-gray-400">{locale === 'he' ? 'כמות' : 'Quantity'}</p>
              <div className="flex gap-2">
                {[1, 2, 3].map((qty) => (
                  <button
                    key={qty}
                    onClick={() => setSelectedQty(qty)}
                    className={`relative flex-1 rounded-xl border py-3 text-sm font-medium transition-all ${
                      selectedQty === qty
                        ? 'border-brand-500 bg-brand-900/40 text-white'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {qty === 3 && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        {locale === 'he' ? 'הכי פופולרי' : 'Most Popular'}
                      </span>
                    )}
                    <span className="block text-base font-bold">{qty}</span>
                    <span className="text-xs opacity-70">{formatPrice(B2C_PRICE_USD * qty, currency)}</span>
                    {qty === 3 && (
                      <span className="mt-0.5 block text-[10px] text-green-400">
                        {locale === 'he' ? 'משלוח חינם' : 'Free Shipping'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleAddToCart}
              className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 py-4 text-lg font-bold text-white shadow-lg shadow-brand-900/40 transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              {t('add_to_cart')} — {formatPrice(B2C_PRICE_USD * selectedQty, currency)}
            </button>
          </div>

          {/* Image side */}
          <div className="relative flex justify-center">
            <div
              className={`relative aspect-square w-full max-w-sm overflow-hidden rounded-3xl bg-gradient-to-br lg:max-w-md ${
                selectedColorData?.gradient ?? 'from-gray-800 to-gray-950'
              }`}
            >
              {selectedColor === 'purple' ? (
                <video
                  ref={videoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 h-full w-full object-contain p-6"
                />
              ) : (
                imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={`SLIDER Kit — ${locale === 'he' ? selectedColorData?.name_he : selectedColorData?.name_en}`}
                    fill
                    className="object-contain p-6"
                    priority
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
