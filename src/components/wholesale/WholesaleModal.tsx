'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { wholesaleSignupSchema, wholesaleLoginSchema } from '@/lib/schemas'
import { signInWholesale } from '@/lib/auth'
import type { WholesaleSignupInput, WholesaleLoginInput } from '@/lib/schemas'
import { SUPPORTED_COUNTRIES } from '@/lib/countries'

interface WholesaleModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function WholesaleModal({ onClose, onSuccess }: WholesaleModalProps) {
  const t = useTranslations('wholesale')
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  // Login form
  const loginForm = useForm<WholesaleLoginInput>({
    resolver: zodResolver(wholesaleLoginSchema),
  })

  // Register form
  const registerForm = useForm<WholesaleSignupInput>({
    resolver: zodResolver(wholesaleSignupSchema),
    defaultValues: { country: 'IL' },
  })

  async function handleLogin(data: WholesaleLoginInput) {
    setLoading(true)
    setError(null)
    try {
      await signInWholesale(data.email, data.password)
      onSuccess()
    } catch {
      setError(t('error_invalid'))
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(data: WholesaleSignupInput) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/wholesale/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(json.error)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error_exists'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wholesale-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-gray-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 id="wholesale-modal-title" className="font-bold text-white">
            {t('title')}
          </h2>
          <button
            ref={closeRef}
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <XMarkIcon className="size-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {(['login', 'register'] as const).map((tabId) => (
            <button
              key={tabId}
              onClick={() => { setTab(tabId); setError(null) }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === tabId
                  ? 'border-b-2 border-brand-500 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tabId === 'login' ? t('login') : t('register')}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          {error && (
            <p className="mb-4 rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-400">{error}</p>
          )}

          {tab === 'login' ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <Field label={t('email')} error={loginForm.formState.errors.email?.message}>
                <input {...loginForm.register('email')} type="email" className="input-field" />
              </Field>
              <Field label={t('password')} error={loginForm.formState.errors.password?.message}>
                <input {...loginForm.register('password')} type="password" className="input-field" />
              </Field>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 py-3 font-bold text-white disabled:opacity-50"
              >
                {loading ? '...' : t('submit_login')}
              </button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('business_name')} error={registerForm.formState.errors.business_name?.message} className="sm:col-span-2">
                  <input {...registerForm.register('business_name')} className="input-field" />
                </Field>
                <Field label={t('contact_name')} error={registerForm.formState.errors.contact_name?.message}>
                  <input {...registerForm.register('contact_name')} className="input-field" />
                </Field>
                <Field label={t('phone')} error={registerForm.formState.errors.phone?.message}>
                  <input {...registerForm.register('phone')} type="tel" className="input-field" />
                </Field>
                <Field label={t('username')} error={registerForm.formState.errors.username?.message}>
                  <input {...registerForm.register('username')} className="input-field" />
                </Field>
                <Field label={t('store_name')} error={registerForm.formState.errors.store_name?.message}>
                  <input {...registerForm.register('store_name')} className="input-field" />
                </Field>
                <Field label="Email" error={registerForm.formState.errors.email?.message} className="sm:col-span-2">
                  <input {...registerForm.register('email')} type="email" className="input-field" />
                </Field>
                <Field label={t('password')} error={registerForm.formState.errors.password?.message} className="sm:col-span-2">
                  <input {...registerForm.register('password')} type="password" className="input-field" />
                </Field>
                <Field label={t('address')} error={registerForm.formState.errors.address?.message} className="sm:col-span-2">
                  <input {...registerForm.register('address')} className="input-field" />
                </Field>
                <Field label={t('city')} error={registerForm.formState.errors.city?.message}>
                  <input {...registerForm.register('city')} className="input-field" />
                </Field>
                <Field label={t('zip')} error={registerForm.formState.errors.zip?.message}>
                  <input {...registerForm.register('zip')} className="input-field" />
                </Field>
                <Field label={t('country')} error={registerForm.formState.errors.country?.message} className="sm:col-span-2">
                  <select {...registerForm.register('country')} className="input-field">
                    {SUPPORTED_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 py-3 font-bold text-white disabled:opacity-50"
              >
                {loading ? '...' : t('submit_register')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
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
      <label className="mb-1 block text-xs text-gray-400">{label}</label>
      {children}
      {error && <p className="mt-0.5 text-xs text-red-400">{error}</p>}
    </div>
  )
}
