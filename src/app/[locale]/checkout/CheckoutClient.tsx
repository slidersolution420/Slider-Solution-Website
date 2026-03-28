'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useStore } from '@/store'
import { formatPrice } from '@/lib/currency'
import { calcPrice } from '@/lib/pricing'
import { getShippingCost, getUpgradeMessage } from '@/lib/shipping'
import { checkoutSchema, type CheckoutInput } from '@/lib/schemas'
import { SUPPORTED_COUNTRIES } from '@/lib/countries'
import NavBar from '@/components/ui/NavBar'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'

interface CheckoutClientProps {
  discountPct: number
  priceUsd: number
  defaultCountry: string
}

export default function CheckoutClient({ discountPct, priceUsd, defaultCountry }: CheckoutClientProps) {
  const t = useTranslations('checkout')
  const tf = useTranslations('forms')
  const locale = useLocale()
  const { items, currency, clearCart, setSelectedCountry } = useStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [consented, setConsented] = useState(false)
  const [consentError, setConsentError] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { currency, items, country: defaultCountry },
  })

  const country = watch('country') ?? 'IL'
  const email = watch('email') ?? ''

  // Pricing with discount
  const { discountedUsd: effectivePrice, hasDiscount, originalUsd } = calcPrice(priceUsd, discountPct)
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0)
  const originalSubtotal = totalQty * originalUsd
  const subtotalUsd = totalQty * effectivePrice
  const shippingUsd = getShippingCost(country, totalQty)
  const grandTotalUsd = subtotalUsd + shippingUsd
  const upgradeMsg = getUpgradeMessage(country, totalQty, locale)

  // Sync selected country to store so CartDrawer shows the right shipping estimate
  useEffect(() => {
    setSelectedCountry(country)
  }, [country, setSelectedCountry])

  // Save cart session to Supabase when email is entered
  useEffect(() => {
    if (!email || items.length === 0) return
    const timeout = setTimeout(() => {
      void fetch('/api/cart-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, cart: items }),
      })
    }, 1000)
    return () => clearTimeout(timeout)
  }, [email, items])

  async function onSubmit(data: CheckoutInput) {
    if (!consented) {
      setConsentError(true)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, items, currency }),
      })
      const json = (await res.json()) as { payment_url?: string; error?: string }
      if (!res.ok || !json.payment_url) {
        throw new Error(json.error ?? t('error'))
      }
      clearCart()
      window.location.href = json.payment_url
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-surface pb-24 pt-24 md:pb-16">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="mb-8 text-2xl font-bold text-white">{t('title')}</h1>

          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Form */}
            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Contact */}
              <section className="rounded-2xl border border-white/10 bg-gray-900/50 p-6">
                <h2 className="mb-4 font-semibold text-white">{t('section_contact')}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t('name')} error={errors.name?.message}>
                    <input
                      {...register('name')}
                      autoComplete="name"
                      className="input-field"
                      placeholder={t('name')}
                    />
                  </Field>
                  <Field label={t('email')} error={errors.email?.message}>
                    <input
                      {...register('email')}
                      type="email"
                      dir="ltr"
                      autoComplete="email"
                      className="input-field"
                      placeholder={t('email')}
                    />
                  </Field>
                  <Field label={t('phone')} error={errors.phone?.message}>
                    <input
                      {...register('phone')}
                      type="tel"
                      dir="ltr"
                      autoComplete="tel"
                      className="input-field"
                      placeholder={t('phone')}
                    />
                  </Field>
                </div>
              </section>

              {/* Shipping */}
              <section className="rounded-2xl border border-white/10 bg-gray-900/50 p-6">
                <h2 className="mb-4 font-semibold text-white">{t('section_shipping')}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t('address')} error={errors.address?.message} className="sm:col-span-2">
                    <input
                      {...register('address')}
                      autoComplete="street-address"
                      className="input-field"
                      placeholder={t('address')}
                    />
                  </Field>
                  <Field label={t('city')} error={errors.city?.message}>
                    <input
                      {...register('city')}
                      autoComplete="address-level2"
                      className="input-field"
                      placeholder={t('city')}
                    />
                  </Field>
                  <Field label={t('zip')} error={errors.zip?.message}>
                    <input
                      {...register('zip')}
                      dir="ltr"
                      autoComplete="postal-code"
                      className="input-field"
                      placeholder={t('zip')}
                    />
                  </Field>
                  <Field label={t('country')} error={errors.country?.message} className="sm:col-span-2">
                    <select {...register('country')} autoComplete="country" className="input-field">
                      {SUPPORTED_COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {upgradeMsg && (
                  <p className="mt-3 rounded-lg bg-brand-900/30 px-3 py-2 text-sm text-brand-300">
                    {upgradeMsg}
                  </p>
                )}
              </section>

              {error && (
                <p className="rounded-xl bg-red-950/50 px-4 py-3 text-sm text-red-400">{error}</p>
              )}

              <div className="space-y-1">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={consented}
                    onChange={(e) => { setConsented(e.target.checked); setConsentError(false) }}
                    className="mt-0.5 size-4 shrink-0 accent-brand-500"
                  />
                  <span className="text-sm text-gray-400">
                    {tf('consent_pre')}
                    <Link href="/terms" className="text-white underline hover:text-brand-400">{tf('terms_link')}</Link>
                    {tf('consent_mid')}
                    <Link href="/cookies" className="text-white underline hover:text-brand-400">{tf('privacy_link')}</Link>
                  </span>
                </label>
                {consentError && <p className="ps-7 text-xs text-red-400">{tf('consent_required')}</p>}
              </div>

              {/* Desktop submit button */}
              <button
                type="submit"
                disabled={loading || items.length === 0 || !consented}
                className="hidden w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 py-4 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 md:block"
              >
                {loading ? t('submitting') : `${t('submit')} — ${formatPrice(grandTotalUsd, currency)}`}
              </button>
            </form>

            {/* Order summary — first on mobile (order-first), right column on desktop (lg:order-last) */}
            <div className="order-first self-start rounded-2xl border border-white/10 bg-gray-900/50 p-6 lg:order-last">
              <h2 className="mb-4 font-semibold text-white">{t('order_summary')}</h2>
              <ul className="mb-4 space-y-3">
                {items.map((item) => (
                  <li key={`${item.productId}-${item.color}`} className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-white">
                      {hasDiscount ? (
                        <span className="flex items-center gap-2">
                          <span className="text-gray-500 line-through">
                            {formatPrice(originalUsd * item.quantity, currency)}
                          </span>
                          <span>{formatPrice(effectivePrice * item.quantity, currency)}</span>
                        </span>
                      ) : (
                        formatPrice(item.priceUsd * item.quantity, currency)
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="space-y-2 border-t border-white/10 pt-3 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>{t('subtotal')}</span>
                  <span>{formatPrice(subtotalUsd, currency)}</span>
                </div>
                {hasDiscount && (
                  <div className="flex justify-between text-green-400">
                    <span>{t('discount')} ({discountPct}%)</span>
                    <span>-{formatPrice(originalSubtotal - subtotalUsd, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400">
                  <span>{t('shipping_cost')}</span>
                  <span>
                    {shippingUsd === 0 ? (
                      <span className="text-green-400">{t('shipping_free')}</span>
                    ) : (
                      formatPrice(shippingUsd, currency)
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-white">
                  <span>{t('total')}</span>
                  <span>{formatPrice(grandTotalUsd, currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky mobile submit bar */}
      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-gray-950/95 p-4 backdrop-blur-sm md:hidden">
          <button
            type="submit"
            form="checkout-form"
            disabled={loading || !consented}
            onClick={() => {
              if (!consented) setConsentError(true)
              void handleSubmit(onSubmit)()
            }}
            className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 py-3.5 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? t('submitting') : `${t('submit')} — ${formatPrice(grandTotalUsd, currency)}`}
          </button>
        </div>
      )}
    </>
  )
}

function Field({
  label,
  error,
  children,
  className = '',
}: {
  label: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm text-gray-400">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}
