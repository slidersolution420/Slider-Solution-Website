'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useStore } from '@/store'
import { B2C_PRICE_USD } from '@/lib/currency'
import { formatPrice } from '@/lib/currency'
import { ShieldCheckIcon, LockClosedIcon } from '@heroicons/react/24/solid'
import type { ProductContent } from '@/lib/keystatic'

interface HeroSectionProps {
  product: ProductContent
  locale: string
  visibleColors: string[]
}

const SUPABASE_STORAGE = `https://ecuhecmfxfavjdxuctkg.supabase.co/storage/v1/object/public/product-images`
const PURPLE_VIDEO_URL = `${SUPABASE_STORAGE}/kit-purple-animation.webm`

function splitHighlight(text: string, words: number): { before: string; highlight: string } {
  const parts = text.split(' ')
  if (parts.length <= words) return { before: '', highlight: text }
  return { before: parts.slice(0, -words).join(' '), highlight: parts.slice(-words).join(' ') }
}

export default function HeroSection({ product, locale, visibleColors }: HeroSectionProps) {
  const t = useTranslations('hero')
  const { addItem, openCart, selectedColor, setSelectedColor, selectedQty, setSelectedQty, currency } =
    useStore()

  const isHe = locale === 'he'
  const tagline = isHe ? product.tagline_he : product.tagline_en
  const description = isHe ? product.description_he : product.description_en

  const { before, highlight } = splitHighlight(tagline, isHe ? 1 : 2)

  const displayColors = visibleColors.length > 0
    ? (product.colors ?? []).filter((c) => visibleColors.includes(c.slug))
    : (product.colors ?? [])

  const selectedColorData = displayColors.find((c) => c.slug === selectedColor) ?? displayColors[0]

  const imageUrl = selectedColorData?.image
    ? `${SUPABASE_STORAGE}/${selectedColorData.image}`
    : null

  const videoRef = useRef<HTMLVideoElement>(null)
  const mobileVideoRef = useRef<HTMLVideoElement>(null)

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

  useEffect(() => {
    const video = mobileVideoRef.current
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
      name: `${product.name} — ${isHe ? selectedColorData.name_he : selectedColorData.name_en}`,
    })
    openCart()
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-surface pt-32 pb-16">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-1/4 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-brand-900/30 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text side */}
          <div>
            {/* Headline */}
            <h1 className="mb-4 text-5xl font-black leading-[1.1] text-white md:text-6xl lg:text-7xl">
              {before}{before ? ' ' : ''}
              <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
                {highlight}
              </span>
            </h1>

            {/* Subtitle with ALL IN ONE highlighted */}
            <p className="mb-6 text-lg leading-relaxed text-gray-300">
              {description.split('ALL IN ONE').map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <strong className="font-bold text-brand-400">ALL IN ONE</strong>
                  )}
                </span>
              ))}
            </p>

            {/* Mobile-only product visual — below description, transparent bg */}
            <div className="mb-6 flex justify-center bg-transparent lg:hidden">
              {selectedColor === 'purple' ? (
                <video
                  ref={mobileVideoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full max-w-[280px] mix-blend-screen"
                />
              ) : (
                imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={`SLIDER Kit — ${isHe ? selectedColorData?.name_he : selectedColorData?.name_en}`}
                    width={280}
                    height={280}
                    className="object-contain"
                  />
                )
              )}
            </div>

            {/* Color selector */}
            {displayColors.length > 1 && (
              <div className="mb-6">
                <div className="flex gap-3" role="radiogroup" aria-label={isHe ? 'צבע' : 'Color'}>
                  {displayColors.map((color) => (
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
                      aria-label={isHe ? color.name_he : color.name_en}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Price stepper card */}
            <div className="mb-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <div className="flex-1">
                <p className="text-2xl font-black text-brand-400">
                  {formatPrice(B2C_PRICE_USD * selectedQty, currency)}
                </p>
                {(isHe || selectedQty >= 3) ? (
                  <p className="text-xs text-green-400">{isHe ? 'משלוח חינם' : 'Free Shipping'}</p>
                ) : (
                  <p className="text-xs text-gray-500">{isHe ? 'יחידות' : 'units'}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                  disabled={selectedQty === 1}
                  className="flex size-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-xl font-bold text-white transition-colors hover:border-white/30 hover:bg-white/10 disabled:opacity-30"
                  aria-label={isHe ? 'הפחת כמות' : 'decrease quantity'}
                >
                  −
                </button>
                <span className="w-8 text-center text-lg font-bold text-white">{selectedQty}</span>
                <button
                  onClick={() => setSelectedQty(Math.min(10, selectedQty + 1))}
                  disabled={selectedQty >= 10}
                  className="flex size-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-xl font-bold text-white transition-colors hover:border-white/30 hover:bg-white/10 disabled:opacity-30"
                  aria-label={isHe ? 'הוסף כמות' : 'increase quantity'}
                >
                  +
                </button>
              </div>
            </div>
            {selectedQty === 10 && (
              <p className="-mt-4 mb-4 text-xs text-gray-400">
                {isHe ? 'צריך יותר מ-10? ' : 'Need more than 10? '}
                <Link
                  href={isHe ? '/wholesale' : '/en/wholesale'}
                  className="text-brand-400 underline hover:text-brand-300"
                >
                  {isHe ? 'הצטרף כמשווק' : 'Join as a wholesaler'}
                </Link>
              </p>
            )}

            {/* Add to cart — desktop only (mobile uses StickyCartBar) */}
            <button
              onClick={handleAddToCart}
              className="hidden w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 py-4 text-base font-bold text-white transition-opacity hover:opacity-90 md:block"
            >
              {t('add_to_cart')} — {formatPrice(B2C_PRICE_USD * selectedQty, currency)}
            </button>

            {/* Bottom stats — 3 trust badges: Patent | Secure Payment | Customers */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              {/* 1. Patent */}
              <span className="flex flex-col items-start rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5">
                <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                  <ShieldCheckIcon className="size-4 text-brand-400" />
                  {t('stat_patent_primary')}
                </span>
                <span className="text-xs text-gray-500">{t('stat_patent_secondary')}</span>
              </span>
              {/* 2. Secure Payment */}
              <span className="flex flex-col items-start rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5">
                <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                  <LockClosedIcon className="size-4 text-brand-400" />
                  {isHe ? 'תשלום מאובטח' : 'Secure Payment'}
                </span>
                <span className="mt-0.5 flex items-center gap-1">
                  <svg className="size-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                  <span className="rounded border border-white/15 px-1 py-px text-[10px] text-gray-400">Apple Pay</span>
                  <span className="rounded border border-white/15 px-1 py-px text-[10px] text-gray-400">Google Pay</span>
                </span>
              </span>
              {/* 3. Customers */}
              <div className="text-center">
                <p className="text-2xl font-black text-white">{t('stat_customers_number')}</p>
                <p className="text-xs text-gray-400">{t('stat_customers_label')}</p>
              </div>
            </div>
          </div>

          {/* Image side — desktop only */}
          <div className="relative hidden justify-center lg:flex">
            {selectedColor === 'purple' ? (
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className="w-full max-w-md"
              />
            ) : (
              <div className="relative aspect-square w-full max-w-md">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={`SLIDER Kit — ${isHe ? selectedColorData?.name_he : selectedColorData?.name_en}`}
                    fill
                    className="object-contain"
                    priority
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
