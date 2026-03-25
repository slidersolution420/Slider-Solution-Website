'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useStore } from '@/store'
import { B2C_PRICE_USD } from '@/lib/currency'
import { formatPrice } from '@/lib/currency'
import {
  TruckIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  StarIcon,
} from '@heroicons/react/24/solid'
import type { ProductContent } from '@/lib/keystatic'

interface HeroSectionProps {
  product: ProductContent
  locale: string
}

const SUPABASE_STORAGE = `https://ecuhecmfxfavjdxuctkg.supabase.co/storage/v1/object/public/product-images`

const BADGE_ICONS = [TruckIcon, UserGroupIcon, ShieldCheckIcon, StarIcon]

export default function HeroSection({ product, locale }: HeroSectionProps) {
  const t = useTranslations('hero')
  const { addItem, openCart, selectedColor, setSelectedColor, selectedQty, setSelectedQty, currency } =
    useStore()

  const tagline = locale === 'he' ? product.tagline_he : product.tagline_en
  const description = locale === 'he' ? product.description_he : product.description_en

  const badges = [
    t('badge_shipping'),
    t('badge_customers'),
    t('badge_patent'),
    t('badge_guarantee'),
  ]

  const selectedColorData = product.colors?.find((c) => c.slug === selectedColor) ?? product.colors?.[0]

  const imageUrl = selectedColorData?.image
    ? `${SUPABASE_STORAGE}/${selectedColorData.image}`
    : null

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
            {/* Tagline */}
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-400">
              {tagline}
            </p>

            {/* Headline */}
            <h1 className="mb-4 text-4xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl">
              {description}
            </h1>

            {/* Badges */}
            <div className="mb-8 flex flex-wrap gap-2">
              {badges.map((badge, i) => {
                const Icon = BADGE_ICONS[i]
                if (!Icon) return null
                return (
                  <span
                    key={badge}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300"
                  >
                    <Icon className="size-3.5 text-brand-400" />
                    {badge}
                  </span>
                )
              })}
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
              <p className="mb-2 text-sm text-gray-400">{t('badge_customers').includes('1,000') ? 'Quantity' : 'כמות'}</p>
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
              className={`relative h-80 w-80 overflow-hidden rounded-3xl bg-gradient-to-br lg:h-96 lg:w-96 ${
                selectedColorData?.gradient ?? 'from-gray-800 to-gray-950'
              }`}
            >
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={`SLIDER Kit — ${locale === 'he' ? selectedColorData?.name_he : selectedColorData?.name_en}`}
                  fill
                  className="object-contain p-6"
                  priority
                />
              )}
            </div>
            {/* Floating price badge */}
            <div className="absolute -bottom-4 -end-4 rounded-2xl bg-brand-600 px-4 py-2 shadow-xl">
              <p className="text-xs text-brand-200">{locale === 'he' ? 'רק' : 'Only'}</p>
              <p className="text-xl font-bold text-white">{formatPrice(B2C_PRICE_USD, currency)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
