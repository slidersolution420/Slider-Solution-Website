'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useStore } from '@/store'
import { formatPrice } from '@/lib/currency'
import { getShippingCost, getUpgradeMessage } from '@/lib/shipping'
import { checkoutSchema, type CheckoutInput } from '@/lib/schemas'
import { SUPPORTED_COUNTRIES } from '@/lib/countries'
import NavBar from '@/components/ui/NavBar'
import { useLocale } from 'next-intl'

export default function CheckoutPage() {
  const t = useTranslations('checkout')
  const locale = useLocale()
  const { items, currency, clearCart } = useStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { currency, items, country: 'IL' },
  })

  const country = watch('country') ?? 'IL'
  const email = watch('email') ?? ''
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotalUsd = items.reduce((sum, i) => sum + i.priceUsd * i.quantity, 0)
  const shippingUsd = getShippingCost(country, totalQty)
  const grandTotalUsd = subtotalUsd + shippingUsd
  const upgradeMsg = getUpgradeMessage(country, totalQty, locale)

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
      <NavBar locale={locale} />
      <main className="min-h-screen bg-surface pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="mb-8 text-2xl font-bold text-white">{t('title')}</h1>

          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Contact */}
              <section className="rounded-2xl border border-white/10 bg-gray-900/50 p-6">
                <h2 className="mb-4 font-semibold text-white">{t('section_contact')}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t('name')} error={errors.name?.message}>
                    <input
                      {...register('name')}
                      className="input-field"
                      placeholder={t('name')}
                    />
                  </Field>
                  <Field label={t('email')} error={errors.email?.message}>
                    <input
                      {...register('email')}
                      type="email"
                      className="input-field"
                      placeholder={t('email')}
                    />
                  </Field>
                  <Field label={t('phone')} error={errors.phone?.message}>
                    <input
                      {...register('phone')}
                      type="tel"
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
                      className="input-field"
                      placeholder={t('address')}
                    />
                  </Field>
                  <Field label={t('city')} error={errors.city?.message}>
                    <input {...register('city')} className="input-field" placeholder={t('city')} />
                  </Field>
                  <Field label={t('zip')} error={errors.zip?.message}>
                    <input {...register('zip')} className="input-field" placeholder={t('zip')} />
                  </Field>
                  <Field label={t('country')} error={errors.country?.message} className="sm:col-span-2">
                    <select {...register('country')} className="input-field">
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

              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 py-4 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? t('submitting') : `${t('submit')} — ${formatPrice(grandTotalUsd, currency)}`}
              </button>
            </form>

            {/* Order summary */}
            <div className="self-start rounded-2xl border border-white/10 bg-gray-900/50 p-6">
              <h2 className="mb-4 font-semibold text-white">{t('order_summary')}</h2>
              <ul className="mb-4 space-y-3">
                {items.map((item) => (
                  <li key={`${item.productId}-${item.color}`} className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-white">
                      {formatPrice(item.priceUsd * item.quantity, currency)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="space-y-2 border-t border-white/10 pt-3 text-sm">
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
