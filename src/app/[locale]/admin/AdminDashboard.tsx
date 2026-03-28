'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { WholesaleAccount, WholesaleAccountStatus, SiteConfig, ReelItem, Review, Order, OrderStatus } from '@/lib/types'
import OrdersDashboard from './OrdersDashboard'

interface AdminDashboardProps {
  accounts: WholesaleAccount[]
  config: SiteConfig
  secret: string
  reviews: Review[]
  orders: Order[]
}


const STATUS_LABELS: Record<WholesaleAccountStatus, string> = {
  pending: 'ממתין',
  active: 'פעיל',
  blocked: 'חסום',
}

const STATUS_COLORS: Record<WholesaleAccountStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  active: 'bg-green-500/20 text-green-300 border-green-500/30',
  blocked: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function AdminDashboard({ accounts, config, secret, reviews, orders }: AdminDashboardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [tab, setTab] = useState<'accounts' | 'orders' | 'content' | 'reviews'>('accounts')

  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [accountError, setAccountError] = useState<string | null>(null)

  async function updateStatus(id: string, status: WholesaleAccountStatus) {
    setLoadingId(id)
    setAccountError(null)
    try {
      const res = await fetch('/api/admin/wholesale', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'שגיאה בעדכון')
      }
      startTransition(() => { router.refresh() })
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'שגיאה לא ידועה')
    } finally {
      setLoadingId(null)
    }
  }

  const pending = accounts.filter((a) => a.status === 'pending')
  const others = accounts.filter((a) => a.status !== 'pending')
  const approvedReviews = reviews.filter((r) => r.approved).length

  const tabs: { id: 'accounts' | 'orders' | 'content' | 'reviews'; label: string }[] = [
    { id: 'accounts', label: 'חשבונות סיטונאי' },
    { id: 'orders', label: 'הזמנות' },
    { id: 'content', label: 'הגדרות תוכן' },
    { id: 'reviews', label: 'ביקורות' },
  ]

  return (
    <div dir="rtl" className="min-h-screen bg-gray-950 p-4 md:p-6 text-white">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700">
              <span className="text-base font-bold text-white">S</span>
            </div>
            <h1 className="text-xl font-bold">לוח ניהול</h1>
          </div>
          <button
            onClick={async () => {
              await fetch('/api/admin/logout', { method: 'POST' })
              window.location.href = '/admin'
            }}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:border-white/20 hover:text-white transition-colors"
          >
            יציאה
          </button>
        </div>

        {/* Stats bar */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="חשבונות סיטונאי" value={accounts.length} />
          <StatCard label="ממתינים לאישור" value={pending.length} highlight={pending.length > 0} />
          <StatCard label="הזמנות" value={orders.length} />
          <StatCard label="ביקורות מאושרות" value={approvedReviews} />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl bg-white/5 p-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.label}
              {t.id === 'accounts' && pending.length > 0 && (
                <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-yellow-500/30 text-xs text-yellow-300">
                  {pending.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'accounts' && (
          <AccountsTab
            pending={pending}
            others={others}
            loadingId={loadingId}
            isPending={isPending}
            error={accountError}
            onUpdateStatus={updateStatus}
          />
        )}

        {tab === 'orders' && (
          <OrdersDashboard orders={orders} secret={secret} />
        )}

        {tab === 'content' && (
          <ContentTab config={config} secret={secret} />
        )}

        {tab === 'reviews' && (
          <ReviewsTab reviews={reviews} secret={secret} />
        )}
      </div>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-white/10 bg-white/[0.02]'}`}>
      <p className={`text-2xl font-bold ${highlight ? 'text-yellow-300' : 'text-white'}`}>{value}</p>
      <p className="mt-0.5 text-xs text-gray-400">{label}</p>
    </div>
  )
}

// ── Accounts Tab ──────────────────────────────────────────────────────────────

function AccountsTab({
  pending, others, loadingId, isPending, error, onUpdateStatus,
}: {
  pending: WholesaleAccount[]
  others: WholesaleAccount[]
  loadingId: string | null
  isPending: boolean
  error: string | null
  onUpdateStatus: (id: string, status: WholesaleAccountStatus) => void
}) {
  const all = [...pending, ...others]
  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/30 p-3 text-red-300 text-sm">
          {error}
        </div>
      )}
      {all.length === 0 ? (
        <p className="text-gray-500 text-center py-16">אין חשבונות סיטונאיים עדיין.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                {['עסק', 'איש קשר', 'טלפון', 'שם משתמש', 'מדינה', 'סטטוס', 'הצטרף', 'פעולות'].map((h) => (
                  <th key={h} className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {all.map((account) => (
                <tr
                  key={account.id}
                  className={`transition-colors hover:bg-white/5 ${account.status === 'pending' ? 'bg-yellow-500/5' : ''}`}
                >
                  <td className="px-4 py-3 font-medium">{account.business_name}</td>
                  <td className="px-4 py-3 text-gray-300">{account.contact_name}</td>
                  <td className="px-4 py-3 text-gray-400">{account.phone}</td>
                  <td className="px-4 py-3 text-gray-400">@{account.username}</td>
                  <td className="px-4 py-3 text-gray-400">{account.country}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[account.status]}`}>
                      {STATUS_LABELS[account.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {new Date(account.created_at).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {account.status !== 'active' && (
                        <button
                          onClick={() => onUpdateStatus(account.id, 'active')}
                          disabled={isPending || loadingId === account.id}
                          className="rounded bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
                        >
                          אישור
                        </button>
                      )}
                      {account.status !== 'blocked' && (
                        <button
                          onClick={() => onUpdateStatus(account.id, 'blocked')}
                          disabled={isPending || loadingId === account.id}
                          className="rounded bg-red-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                        >
                          חסום
                        </button>
                      )}
                      {account.status !== 'pending' && (
                        <button
                          onClick={() => onUpdateStatus(account.id, 'pending')}
                          disabled={isPending || loadingId === account.id}
                          className="rounded bg-white/10 px-2.5 py-1 text-xs font-medium text-gray-300 hover:bg-white/20 disabled:opacity-50 transition-colors"
                        >
                          ביטול
                        </button>
                      )}
                      {loadingId === account.id && (
                        <span className="text-gray-500 text-xs">שומר...</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

// ── Reviews Tab ───────────────────────────────────────────────────────────────

function ReviewsTab({ reviews, secret }: { reviews: Review[]; secret: string }) {
  const [items, setItems] = useState<Review[]>(reviews)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function toggleApproval(id: string, approved: boolean) {
    setLoadingId(id)
    setError(null)
    // Optimistic update
    setItems((prev) => prev.map((r) => r.id === id ? { ...r, approved } : r))
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
        body: JSON.stringify({ id, approved }),
      })
      if (!res.ok) {
        // Revert on failure
        setItems((prev) => prev.map((r) => r.id === id ? { ...r, approved: !approved } : r))
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'שגיאה בעדכון')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/30 p-3 text-red-300 text-sm">
          {error}
        </div>
      )}
      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-16">אין ביקורות עדיין.</p>
      ) : (
        <div className="space-y-3">
          {items.map((review) => (
            <div
              key={review.id}
              className={`rounded-xl border p-4 transition-colors ${
                review.approved ? 'border-green-500/20 bg-green-500/5' : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-sm text-white">{review.name}</span>
                    <span className="text-yellow-400 text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{review.body}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                    review.approved
                      ? 'bg-green-500/20 text-green-300 border-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                  }`}>
                    {review.approved ? 'מאושר' : 'ממתין'}
                  </span>
                  <button
                    onClick={() => toggleApproval(review.id, !review.approved)}
                    disabled={loadingId === review.id}
                    className={`rounded px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                      review.approved
                        ? 'bg-red-900/40 text-red-300 hover:bg-red-800/50'
                        : 'bg-green-600 text-white hover:bg-green-500'
                    }`}
                  >
                    {loadingId === review.id ? '...' : review.approved ? 'הסתר' : 'אשר'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// ── Content Tab ───────────────────────────────────────────────────────────────

function ContentTab({ config, secret }: { config: SiteConfig; secret: string }) {
  const router = useRouter()
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [prices, setPrices] = useState({
    price_b2c_usd: config.price_b2c_usd,
    price_b2b_usd: config.price_b2b_usd,
    stock: config.stock,
    discount_pct: config.discount_pct,
  })
  const [ticker, setTicker] = useState({
    ticker_he: config.ticker_he,
    ticker_en: config.ticker_en,
  })
  const [tickerEnabled, setTickerEnabled] = useState(config.ticker_enabled)
  const [socials, setSocials] = useState({
    instagram_url: config.instagram_url,
    facebook_url: config.facebook_url,
    whatsapp_number: config.whatsapp_number,
  })
  const [shipping, setShipping] = useState({
    free_shipping_countries: config.free_shipping_countries.join(', '),
    free_shipping_min_qty: config.free_shipping_min_qty,
    intl_paid_shipping_usd: config.intl_paid_shipping_usd,
  })
  const [reels, setReels] = useState<ReelItem[]>(config.instagram_reels)
  const [ageGate, setAgeGate] = useState(config.age_gate_enabled)
  const [visibleColors, setVisibleColors] = useState<string[]>(config.visible_colors)

  async function save(key: string, value: unknown, sectionId: string) {
    setSaving(sectionId)
    setSaved(null)
    setError(null)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
        body: JSON.stringify({ key, value }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'שגיאה בשמירה')
      }
      setSaved(sectionId)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בשמירה')
    } finally {
      setSaving(null)
    }
  }

  async function saveSection(sectionId: string, entries: [string, unknown][]) {
    setSaving(sectionId)
    setSaved(null)
    setError(null)
    try {
      for (const [key, value] of entries) {
        const res = await fetch('/api/admin/config', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
          body: JSON.stringify({ key, value }),
        })
        if (!res.ok) {
          const data = await res.json() as { error?: string }
          throw new Error(data.error ?? 'שגיאה בשמירה')
        }
      }
      setSaved(sectionId)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בשמירה')
    } finally {
      setSaving(null)
    }
  }

  const inputCls = 'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none'
  const labelCls = 'mb-1 block text-xs font-medium text-gray-400'

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-500/20 border border-red-500/30 p-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* מחירים ומלאי */}
      <Section title="מחירים ומלאי" savedId={saved} sectionId="prices">
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className={labelCls}>מחיר קצה (דולר)</label>
            <input type="number" className={inputCls} value={prices.price_b2c_usd}
              onChange={(e) => setPrices((p) => ({ ...p, price_b2c_usd: Number(e.target.value) }))} />
          </div>
          <div>
            <label className={labelCls}>מחיר סיטונאי (דולר)</label>
            <input type="number" className={inputCls} value={prices.price_b2b_usd}
              onChange={(e) => setPrices((p) => ({ ...p, price_b2b_usd: Number(e.target.value) }))} />
          </div>
          <div>
            <label className={labelCls}>מלאי (0 = אזל)</label>
            <input type="number" className={inputCls} value={prices.stock}
              onChange={(e) => setPrices((p) => ({ ...p, stock: Number(e.target.value) }))} />
          </div>
          <div>
            <label className={labelCls}>הנחה (%)</label>
            <input type="number" min={0} max={100} className={inputCls} value={prices.discount_pct}
              onChange={(e) => setPrices((p) => ({ ...p, discount_pct: Math.max(0, Math.min(100, Number(e.target.value))) }))} />
            <p className="mt-1 text-xs text-gray-500">0 = ללא הנחה</p>
          </div>
        </div>
        <SaveRow sectionId="prices" saving={saving} saved={saved}
          onSave={() => saveSection('prices', [
            ['price_b2c_usd', prices.price_b2c_usd],
            ['price_b2b_usd', prices.price_b2b_usd],
            ['stock', prices.stock],
            ['discount_pct', prices.discount_pct],
          ])} />
      </Section>

      {/* פס גלילה */}
      <Section title="פס גלילה" savedId={saved} sectionId="ticker">
        <label className="flex items-center gap-3 cursor-pointer mb-4">
          <input type="checkbox" className="size-4 accent-brand-500" checked={tickerEnabled}
            onChange={(e) => setTickerEnabled(e.target.checked)} />
          <span className="text-sm text-gray-300">הצג פס גלילה בדף הבית</span>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>טקסט בעברית</label>
            <input type="text" className={inputCls} value={ticker.ticker_he}
              onChange={(e) => setTicker((t) => ({ ...t, ticker_he: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>טקסט באנגלית</label>
            <input type="text" className={inputCls} value={ticker.ticker_en}
              onChange={(e) => setTicker((t) => ({ ...t, ticker_en: e.target.value }))} />
          </div>
        </div>
        <SaveRow sectionId="ticker" saving={saving} saved={saved}
          onSave={() => saveSection('ticker', [
            ['ticker_enabled', tickerEnabled],
            ['ticker_he', ticker.ticker_he],
            ['ticker_en', ticker.ticker_en],
          ])} />
      </Section>

      {/* רשתות חברתיות */}
      <Section title="רשתות חברתיות" savedId={saved} sectionId="socials">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>קישור אינסטגרם</label>
            <input type="url" className={inputCls} value={socials.instagram_url}
              onChange={(e) => setSocials((s) => ({ ...s, instagram_url: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>קישור פייסבוק</label>
            <input type="url" className={inputCls} value={socials.facebook_url}
              onChange={(e) => setSocials((s) => ({ ...s, facebook_url: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>מספר וואטסאפ</label>
            <input type="text" className={inputCls} placeholder="972501234567" value={socials.whatsapp_number}
              onChange={(e) => setSocials((s) => ({ ...s, whatsapp_number: e.target.value }))} />
          </div>
        </div>
        <SaveRow sectionId="socials" saving={saving} saved={saved}
          onSave={() => saveSection('socials', [
            ['instagram_url', socials.instagram_url],
            ['facebook_url', socials.facebook_url],
            ['whatsapp_number', socials.whatsapp_number],
          ])} />
      </Section>

      {/* הגדרות משלוח */}
      <Section title="הגדרות משלוח" savedId={saved} sectionId="shipping">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>מדינות משלוח חינם (מופרדות בפסיק)</label>
            <input type="text" className={inputCls} placeholder="IL, US" value={shipping.free_shipping_countries}
              onChange={(e) => setShipping((s) => ({ ...s, free_shipping_countries: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>כמות מינימום לחינם</label>
            <input type="number" className={inputCls} value={shipping.free_shipping_min_qty}
              onChange={(e) => setShipping((s) => ({ ...s, free_shipping_min_qty: Number(e.target.value) }))} />
          </div>
          <div>
            <label className={labelCls}>משלוח בינלאומי (דולר)</label>
            <input type="number" className={inputCls} value={shipping.intl_paid_shipping_usd}
              onChange={(e) => setShipping((s) => ({ ...s, intl_paid_shipping_usd: Number(e.target.value) }))} />
          </div>
        </div>
        <SaveRow sectionId="shipping" saving={saving} saved={saved}
          onSave={() => saveSection('shipping', [
            ['free_shipping_countries', shipping.free_shipping_countries.split(',').map((c) => c.trim()).filter(Boolean)],
            ['free_shipping_min_qty', shipping.free_shipping_min_qty],
            ['intl_paid_shipping_usd', shipping.intl_paid_shipping_usd],
          ])} />
      </Section>

      {/* ריילס אינסטגרם */}
      <Section title="ריילס אינסטגרם" savedId={saved} sectionId="reels">
        <div className="space-y-3">
          {reels.map((reel, i) => (
            <div key={reel.video_url || `new-reel-${i}`} className="flex gap-3 items-start rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div className="flex-1">
                <label className={labelCls}>קישור וידאו (MP4 ב-Supabase Storage)</label>
                <input type="text" className={inputCls} placeholder="https://..."
                  value={reel.video_url}
                  onChange={(e) => {
                    const updated = [...reels]
                    updated[i] = { ...updated[i], video_url: e.target.value }
                    setReels(updated)
                  }} />
              </div>
              <div className="flex-1">
                <label className={labelCls}>קישור לריל (אופציונלי)</label>
                <input type="text" className={inputCls} placeholder="https://instagram.com/reel/..."
                  value={reel.link_url ?? ''}
                  onChange={(e) => {
                    const updated = [...reels]
                    updated[i] = { ...updated[i], link_url: e.target.value || null }
                    setReels(updated)
                  }} />
              </div>
              <button onClick={() => setReels(reels.filter((_, j) => j !== i))}
                className="mt-5 rounded bg-red-900/50 px-2 py-2 text-xs text-red-300 hover:bg-red-800/50 transition-colors">
                ✕
              </button>
            </div>
          ))}
          <button onClick={() => setReels([...reels, { video_url: '', link_url: null }])}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:border-white/20 hover:text-white transition-colors">
            + הוסף ריל
          </button>
        </div>
        <SaveRow sectionId="reels" saving={saving} saved={saved}
          onSave={() => save('instagram_reels', reels.filter((r) => r.video_url), 'reels')} />
      </Section>

      {/* חסם גיל */}
      <Section title="חסם גיל" savedId={saved} sectionId="agegate">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="size-4 accent-brand-500" checked={ageGate}
            onChange={(e) => setAgeGate(e.target.checked)} />
          <span className="text-sm text-gray-300">הפעל חסם גיל 21+ בדף הבית</span>
        </label>
        <SaveRow sectionId="agegate" saving={saving} saved={saved}
          onSave={() => save('age_gate_enabled', ageGate, 'agegate')} />
      </Section>

      {/* צבעי מוצר */}
      <Section title="צבעי מוצר" savedId={saved} sectionId="colors">
        <p className="mb-3 text-xs text-gray-500">בחר אילו צבעים יוצגו בדף המוצר.</p>
        <div className="space-y-2">
          {[
            { slug: 'purple', label: 'סגול', swatch: 'from-purple-800 to-purple-950' },
            { slug: 'black',  label: 'שחור', swatch: 'from-gray-800 to-gray-950' },
            { slug: 'blue',   label: 'כחול',  swatch: 'from-blue-800 to-blue-950' },
          ].map(({ slug, label, swatch }) => (
            <label key={slug} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="size-4 accent-brand-500"
                checked={visibleColors.includes(slug)}
                onChange={(e) => {
                  setVisibleColors(e.target.checked
                    ? [...visibleColors, slug]
                    : visibleColors.filter((s) => s !== slug))
                }} />
              <span className={`size-4 rounded-full bg-gradient-to-br ${swatch} shrink-0`} />
              <span className="text-sm text-gray-300">{label}</span>
            </label>
          ))}
        </div>
        <SaveRow sectionId="colors" saving={saving} saved={saved}
          onSave={() => save('visible_colors', visibleColors, 'colors')} />
      </Section>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Section({
  title, children, savedId, sectionId,
}: {
  title: string
  children: React.ReactNode
  savedId: string | null
  sectionId: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-300">{title}</h2>
        {savedId === sectionId && (
          <span className="text-xs text-green-400">✓ נשמר</span>
        )}
      </div>
      {children}
    </div>
  )
}

function SaveRow({
  sectionId, saving, saved, onSave,
}: {
  sectionId: string
  saving: string | null
  saved: string | null
  onSave: () => void
}) {
  return (
    <div className="mt-4 flex justify-start">
      <button
        onClick={onSave}
        disabled={saving === sectionId}
        className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
          saving === sectionId
            ? 'bg-white/10 text-gray-400 cursor-not-allowed'
            : 'bg-brand-600 text-white hover:bg-brand-500'
        }`}
      >
        {saving === sectionId ? 'שומר...' : 'שמור'}
      </button>
    </div>
  )
}
