'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { formatPrice } from '@/lib/currency'
import { getShippingCost } from '@/lib/shipping'
import { SUPPORTED_COUNTRIES } from '@/lib/countries'
import { trackBeginCheckout } from '@/lib/analytics'
import { createClient } from '@/lib/supabase'
import { checkoutSchema, type CheckoutInput } from '@/lib/schemas'
import type { ProductColor } from '@/lib/types'

const COLOR_DOTS: Record<ProductColor, string> = {
  black: 'bg-[#0F0F0F] border border-gray-600',
  blue: 'bg-[#1D4ED8]',
  purple: 'bg-[#7C3AED]',
}

const COLOR_NAMES: Record<ProductColor, string> = {
  black: 'Black Kit',
  blue: 'Blue Kit',
  purple: 'Purple Kit',
}

export default function CheckoutPage() {
  const t = useTranslations('checkout')
  const locale = useLocale()
  const router = useRouter()

  const cart = useStore((s) => s.cart)
  const currency = useStore((s) => s.currency)
  const setCartSessionId = useStore((s) => s.setCartSessionId)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      router.replace(`/${locale}`)
    }
  }, [cart.length, locale, router])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      cart: cart.map((item) => ({
        id: item.productId,
        color: item.color,
        qty: item.qty,
        priceUsd: item.priceUsd,
      })),
      currency,
    },
  })

  const selectedCountry = watch('customer.country') ?? ''

  const subtotalUsd = cart.reduce((sum, i) => sum + i.priceUsd * i.qty, 0)
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0)
  const shippingUsd = selectedCountry
    ? getShippingCost(selectedCountry, totalQty, 'USD')
    : 0
  const grandTotalUsd = subtotalUsd + shippingUsd

  const onSubmit = async (data: CheckoutInput) => {
    setSubmitting(true)
    setSubmitError(null)

    try {
      // 1. Write cart_session row
      const supabase = createClient()
      const { data: session } = await supabase
        .from('cart_sessions')
        .insert({ email: data.customer.email, cart: cart, status: 'active' })
        .select('id')
        .single()

      if (session?.id) setCartSessionId(session.id as string)

      // 2. Analytics
      trackBeginCheckout({
        items: cart,
        totalUsd: grandTotalUsd,
        currency,
        shippingCountry: data.customer.country,
      })

      // 3. Build payload — map productId → id for schema
      const payload: CheckoutInput = {
        ...data,
        cart: cart.map((item) => ({
          id: item.productId,
          color: item.color,
          qty: item.qty,
          priceUsd: item.priceUsd,
        })),
        currency,
      }

      // 4. Call API
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = (await res.json()) as {
        success: boolean
        error?: string
        data?: { sessionUrl: string; sessionId: string }
      }

      if (!json.success || !json.data) {
        setSubmitError(json.error ?? t('error.generic'))
        return
      }

      // 5. Redirect
      const { sessionUrl } = json.data
      if (sessionUrl.includes('/order/mock-')) {
        const pathname = new URL(sessionUrl, window.location.origin).pathname
        router.push(pathname)
      } else {
        window.location.href = sessionUrl
      }
    } catch {
      setSubmitError(t('error.generic'))
    } finally {
      setSubmitting(false)
    }
  }

  if (cart.length === 0) return null

  const inputCls =
    'w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-outfit text-sm placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors'
  const errorCls = 'text-red-400 text-xs font-outfit mt-1'
  const labelCls = 'block text-xs font-outfit text-gray-400 mb-1'

  return (
    <div className="min-h-screen bg-[#07080F] pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Page heading */}
        <h1 className="text-2xl font-syne font-bold text-white mb-8">
          {t('section.shipping')}
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col lg:flex-row gap-8"
        >
          {/* ── Left: Form ─────────────────────────────────────── */}
          <div className="flex-1 space-y-4">
            {/* Full name */}
            <div>
              <label className={labelCls}>{t('field.name')}</label>
              <input
                {...register('customer.name')}
                className={inputCls}
                placeholder={t('field.name')}
                autoComplete="name"
              />
              {errors.customer?.name && (
                <p className={errorCls}>{errors.customer.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className={labelCls}>{t('field.email')}</label>
              <input
                {...register('customer.email')}
                type="email"
                className={inputCls}
                placeholder={t('field.email')}
                autoComplete="email"
              />
              {errors.customer?.email && (
                <p className={errorCls}>{errors.customer.email.message}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className={labelCls}>{t('field.address')}</label>
              <input
                {...register('customer.address')}
                className={inputCls}
                placeholder={t('addr.placeholder')}
                autoComplete="street-address"
              />
              {errors.customer?.address && (
                <p className={errorCls}>{errors.customer.address.message}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className={labelCls}>{t('field.city')}</label>
              <input
                {...register('customer.city')}
                className={inputCls}
                placeholder={t('field.city')}
                autoComplete="address-level2"
              />
              {errors.customer?.city && (
                <p className={errorCls}>{errors.customer.city.message}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <label className={labelCls}>{t('field.country')}</label>
              <select
                {...register('customer.country')}
                className={`${inputCls} cursor-pointer`}
              >
                <option value="" disabled>
                  {t('field.country')}
                </option>
                {SUPPORTED_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.customer?.country && (
                <p className={errorCls}>{errors.customer.country.message}</p>
              )}
            </div>

            {/* Postal Code */}
            <div>
              <label className={labelCls}>{t('field.zip')}</label>
              <input
                {...register('customer.zip')}
                className={inputCls}
                placeholder={t('field.zip')}
                autoComplete="postal-code"
              />
              {errors.customer?.zip && (
                <p className={errorCls}>{errors.customer.zip.message}</p>
              )}
            </div>

            {/* Submit error */}
            {submitError && (
              <p className="text-red-400 text-sm font-outfit">{submitError}</p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-purple w-full text-base py-4 mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  {t('processing')}
                </>
              ) : (
                t('cta')
              )}
            </button>
          </div>

          {/* ── Right: Order Summary ────────────────────────────── */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="card-surface p-6 space-y-4 sticky top-24">
              <h2 className="font-syne font-bold text-white">
                {t('summary.title')}
              </h2>

              {/* Line items */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.color}`}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={`w-7 h-7 rounded-full shrink-0 ${COLOR_DOTS[item.color]}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-outfit text-white truncate">
                        {COLOR_NAMES[item.color]}
                      </p>
                      <p className="text-xs font-outfit text-gray-500">
                        ×{item.qty}
                      </p>
                    </div>
                    <p className="text-sm font-outfit text-white shrink-0">
                      {formatPrice(item.priceUsd * item.qty, currency)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/5 pt-3 space-y-2">
                {/* Shipping */}
                <div className="flex items-center justify-between text-sm font-outfit">
                  <span className="text-gray-400">{t('summary.shipping')}</span>
                  <span
                    className={
                      selectedCountry
                        ? shippingUsd === 0
                          ? 'text-green-400'
                          : 'text-gray-300'
                        : 'text-gray-500 text-xs'
                    }
                  >
                    {!selectedCountry
                      ? t('shipping.unknown')
                      : shippingUsd === 0
                        ? t('shipping.free')
                        : t('shipping.paid')}
                  </span>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between font-syne font-bold pt-1">
                  <span className="text-white">{t('summary.total')}</span>
                  <span className="text-white text-lg">
                    {formatPrice(grandTotalUsd, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
