'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useStore } from '@/store'
import { signInWholesale, signUpWholesale } from '@/lib/auth'
import { wholesaleSignupSchema, type WholesaleSignupInput } from '@/lib/schemas'
import { trackSignupWholesale } from '@/lib/analytics'
import { SUPPORTED_COUNTRIES } from '@/lib/countries'

type Tab = 'login' | 'signup'

// ─── Shared input style ───────────────────────────────────────────────────────

const inputClass =
  'w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 font-outfit text-sm focus:outline-none focus:border-purple-500 transition-colors'

const labelClass = 'block text-xs font-outfit font-medium text-gray-400 mb-1'

const errorClass = 'text-xs text-red-400 mt-1'

// ─── Login Form ───────────────────────────────────────────────────────────────

interface LoginFormProps {
  onSwitchToSignup: () => void
  onSuccess: () => void
}

function LoginForm({ onSwitchToSignup, onSuccess }: LoginFormProps) {
  const t = useTranslations('wholesale')
  const setIsWholesaleUser = useStore((s) => s.setIsWholesaleUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signInWholesale(email, password)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setIsWholesaleUser(true)
    onSuccess()
  }

  return (
    <form onSubmit={(e) => { void handleSubmit(e) }} className="space-y-4">
      <div>
        <label className={labelClass}>{t('form.email')}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>{t('form.password')}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className={inputClass}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400 font-outfit bg-red-400/10 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-full bg-gradient-to-r from-purple-700 to-purple-500 text-white font-outfit font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? '...' : t('modal.cta.login')}
      </button>

      <p className="text-center text-xs font-outfit text-gray-500">
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-purple-400 hover:text-purple-300 transition-colors"
        >
          {t('modal.signup.link')}
        </button>
      </p>
    </form>
  )
}

// ─── Signup Form ──────────────────────────────────────────────────────────────

interface SignupFormProps {
  onSwitchToLogin: () => void
  onSuccess: (country: string) => void
}

function SignupForm({ onSwitchToLogin, onSuccess }: SignupFormProps) {
  const t = useTranslations('wholesale')
  const setIsWholesaleUser = useStore((s) => s.setIsWholesaleUser)
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WholesaleSignupInput>({
    resolver: zodResolver(wholesaleSignupSchema),
  })

  async function onSubmit(data: WholesaleSignupInput) {
    setServerError(null)
    setLoading(true)

    const result = await signUpWholesale(data.email, data.password, {
      business_name: data.storeName,
      contact_name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      username: data.username,
      store_name: data.storeName,
      address: data.address,
      city: data.city,
      country: data.country,
      zip: data.zip,
    })

    if (result.error) {
      setServerError(result.error)
      setLoading(false)
      return
    }

    // Trigger welcome + owner alert emails (fire-and-forget)
    if (result.account?.id) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
      fetch(`${appUrl}/api/email/wholesale-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: result.account.id }),
      }).catch((err: unknown) =>
        console.error('[signup] email trigger failed:', err),
      )
    }

    setIsWholesaleUser(true)
    trackSignupWholesale(data.country)
    onSuccess(data.country)
  }

  return (
    <form
      onSubmit={(e) => { void handleSubmit(onSubmit)(e) }}
      className="space-y-3"
    >
      {/* Switch to login */}
      <p className="text-center text-xs font-outfit text-gray-500 mb-4">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-purple-400 hover:text-purple-300 transition-colors"
        >
          {t('modal.login.link')}
        </button>
      </p>

      {/* First + Last name row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>{t('form.firstName')}</label>
          <input
            {...register('firstName')}
            type="text"
            autoComplete="given-name"
            className={inputClass}
          />
          {errors.firstName && (
            <p className={errorClass}>{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>{t('form.lastName')}</label>
          <input
            {...register('lastName')}
            type="text"
            autoComplete="family-name"
            className={inputClass}
          />
          {errors.lastName && (
            <p className={errorClass}>{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className={labelClass}>{t('form.phone')}</label>
        <input
          {...register('phone')}
          type="tel"
          autoComplete="tel"
          className={inputClass}
        />
        {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label className={labelClass}>{t('form.email')}</label>
        <input
          {...register('email')}
          type="email"
          autoComplete="email"
          className={inputClass}
        />
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
      </div>

      {/* Username */}
      <div>
        <label className={labelClass}>{t('form.username')}</label>
        <input
          {...register('username')}
          type="text"
          autoComplete="username"
          className={inputClass}
        />
        {errors.username && (
          <p className={errorClass}>{errors.username.message}</p>
        )}
      </div>

      {/* Password + Confirm */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>{t('form.password')}</label>
          <input
            {...register('password')}
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputClass}
          />
          {errors.password && (
            <p className={errorClass}>{errors.password.message}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>{t('form.confirmPassword')}</label>
          <input
            {...register('confirmPassword')}
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputClass}
          />
          {errors.confirmPassword && (
            <p className={errorClass}>{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      {/* Store Name */}
      <div>
        <label className={labelClass}>{t('form.storeName')}</label>
        <input
          {...register('storeName')}
          type="text"
          placeholder="Name of Store/Franchise"
          className={inputClass}
        />
        {errors.storeName && (
          <p className={errorClass}>{errors.storeName.message}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label className={labelClass}>{t('form.address')}</label>
        <input
          {...register('address')}
          type="text"
          autoComplete="street-address"
          className={inputClass}
        />
        {errors.address && (
          <p className={errorClass}>{errors.address.message}</p>
        )}
      </div>

      {/* City + Zip row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>{t('form.city')}</label>
          <input
            {...register('city')}
            type="text"
            autoComplete="address-level2"
            className={inputClass}
          />
          {errors.city && <p className={errorClass}>{errors.city.message}</p>}
        </div>
        <div>
          <label className={labelClass}>{t('form.zip')}</label>
          <input
            {...register('zip')}
            type="text"
            autoComplete="postal-code"
            className={inputClass}
          />
          {errors.zip && <p className={errorClass}>{errors.zip.message}</p>}
        </div>
      </div>

      {/* Country */}
      <div>
        <label className={labelClass}>{t('form.country')}</label>
        <select
          {...register('country')}
          className={`${inputClass} cursor-pointer`}
          defaultValue=""
        >
          <option value="" disabled>
            —
          </option>
          {SUPPORTED_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.country && (
          <p className={errorClass}>{errors.country.message}</p>
        )}
      </div>

      {/* Consent */}
      <div className="flex items-start gap-3 pt-1">
        <input
          {...register('consent')}
          id="consent"
          type="checkbox"
          className="mt-0.5 w-4 h-4 accent-purple-500 cursor-pointer shrink-0"
        />
        <label
          htmlFor="consent"
          className="text-xs font-outfit text-gray-400 cursor-pointer leading-relaxed"
        >
          {t('form.consent')}
        </label>
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-red-400 font-outfit bg-red-400/10 rounded-lg px-3 py-2">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-full bg-gradient-to-r from-purple-700 to-purple-500 text-white font-outfit font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
      >
        {loading ? '...' : t('modal.cta.signup')}
      </button>
    </form>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function WholesaleModal() {
  const t = useTranslations('wholesale')
  const modals = useStore((s) => s.modals)
  const closeModal = useStore((s) => s.closeModal)
  const [activeTab, setActiveTab] = useState<Tab>('login')

  const isOpen = modals.wholesale
  const modalRef = useRef<HTMLDivElement>(null)

  // Escape key + scroll lock + focus management
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal('wholesale')
    }
    if (isOpen) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
      setTimeout(() => modalRef.current?.focus(), 50)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeModal])

  function handleSuccess() {
    closeModal('wholesale')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="wholesale-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeModal('wholesale')}
            className="fixed inset-0 bg-black/60 z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="wholesale-modal"
              ref={modalRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label={
                activeTab === 'login'
                  ? t('modal.title.login')
                  : t('modal.title.signup')
              }
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-md bg-[#0F1629] rounded-2xl border border-white/10 flex flex-col max-h-[90vh] focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 shrink-0">
                <h2 className="font-syne font-bold text-lg text-white">
                  {activeTab === 'login'
                    ? t('modal.title.login')
                    : t('modal.title.signup')}
                </h2>
                <button
                  onClick={() => closeModal('wholesale')}
                  aria-label="Close"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/5 shrink-0">
                {(['login', 'signup'] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-sm font-outfit font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-white border-b-2 border-purple-500'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {tab === 'login' ? t('tab_login') : t('tab_signup')}
                  </button>
                ))}
              </div>

              {/* Body — scrollable */}
              <div className="overflow-y-auto px-6 py-6 flex-1">
                {activeTab === 'login' ? (
                  <LoginForm
                    onSwitchToSignup={() => setActiveTab('signup')}
                    onSuccess={handleSuccess}
                  />
                ) : (
                  <SignupForm
                    onSwitchToLogin={() => setActiveTab('login')}
                    onSuccess={handleSuccess}
                  />
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
