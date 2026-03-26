'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import NavBar from '@/components/ui/NavBar'
import Footer from '@/components/ui/Footer'

export default function ContactPage() {
  const t = useTranslations('contact')
  const locale = useLocale()
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-surface pt-24 pb-16">
        <div className="mx-auto max-w-lg px-4">
          <div className="mb-10 text-center">
            <h1 className="mb-2 text-3xl font-bold text-white">{t('title')}</h1>
            <p className="text-gray-400">{t('subtitle')}</p>
          </div>

          {status === 'success' ? (
            <div className="rounded-2xl border border-green-800 bg-green-950/40 p-8 text-center">
              <p className="text-lg font-semibold text-green-400">{t('success')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-gray-400">{t('name')}</label>
                <input
                  required
                  className="input-field"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t('name')}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-gray-400">{t('email')}</label>
                <input
                  required
                  type="email"
                  className="input-field"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={t('email')}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-gray-400">{t('message')}</label>
                <textarea
                  required
                  rows={5}
                  className="input-field resize-none"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={t('message')}
                />
              </div>

              {status === 'error' && (
                <p className="text-sm text-red-400">{t('error')}</p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 py-3.5 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {status === 'sending' ? t('submitting') : t('submit')}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
