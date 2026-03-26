'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { WholesaleAccount, WholesaleAccountStatus } from '@/lib/types'
import type { SiteConfig, ReelItem } from '@/lib/types'

interface AdminDashboardProps {
  accounts: WholesaleAccount[]
  config: SiteConfig
  secret: string
}

const STATUS_LABELS: Record<WholesaleAccountStatus, string> = {
  pending: 'Pending',
  active: 'Active',
  blocked: 'Blocked',
}

const STATUS_COLORS: Record<WholesaleAccountStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  active: 'bg-green-500/20 text-green-300 border-green-500/30',
  blocked: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function AdminDashboard({ accounts, config, secret }: AdminDashboardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [tab, setTab] = useState<'accounts' | 'content'>('accounts')

  // Account actions
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [accountError, setAccountError] = useState<string | null>(null)

  async function updateStatus(id: string, status: WholesaleAccountStatus) {
    setLoadingId(id)
    setAccountError(null)
    try {
      const res = await fetch('/api/admin/wholesale', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Update failed')
      }
      startTransition(() => { router.refresh() })
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoadingId(null)
    }
  }

  const pending = accounts.filter((a) => a.status === 'pending')
  const others = accounts.filter((a) => a.status !== 'pending')

  return (
    <div className="min-h-screen bg-gray-950 p-6 text-white">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-sm text-yellow-300 border border-yellow-500/30">
              {pending.length} pending
            </span>
            <button
              onClick={async () => {
                await fetch('/api/admin/logout', { method: 'POST' })
                window.location.href = '/admin'
              }}
              className="rounded-lg border border-white/10 px-3 py-1 text-xs text-gray-400 hover:border-white/20 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg bg-white/5 p-1 w-fit">
          <button
            onClick={() => setTab('accounts')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'accounts' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Accounts
          </button>
          <button
            onClick={() => setTab('content')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'content' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Content Settings
          </button>
        </div>

        {tab === 'accounts' && (
          <AccountsTab
            accounts={accounts}
            pending={pending}
            others={others}
            loadingId={loadingId}
            isPending={isPending}
            error={accountError}
            onUpdateStatus={updateStatus}
          />
        )}

        {tab === 'content' && (
          <ContentTab config={config} secret={secret} />
        )}
      </div>
    </div>
  )
}

// ── Accounts Tab ─────────────────────────────────────────────────────────────

interface AccountsTabProps {
  accounts: WholesaleAccount[]
  pending: WholesaleAccount[]
  others: WholesaleAccount[]
  loadingId: string | null
  isPending: boolean
  error: string | null
  onUpdateStatus: (id: string, status: WholesaleAccountStatus) => void
}

function AccountsTab({ accounts, pending, others, loadingId, isPending, error, onUpdateStatus }: AccountsTabProps) {
  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/30 p-3 text-red-300 text-sm">
          {error}
        </div>
      )}
      {accounts.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No wholesale accounts yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                {['Business', 'Contact', 'Phone', 'Username', 'Country', 'Status', 'Signed up', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[...pending, ...others].map((account) => (
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
                    {new Date(account.created_at).toLocaleDateString('en-IL')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {account.status !== 'active' && (
                        <button
                          onClick={() => onUpdateStatus(account.id, 'active')}
                          disabled={isPending || loadingId === account.id}
                          className="rounded bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {account.status !== 'blocked' && (
                        <button
                          onClick={() => onUpdateStatus(account.id, 'blocked')}
                          disabled={isPending || loadingId === account.id}
                          className="rounded bg-red-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                        >
                          Block
                        </button>
                      )}
                      {account.status !== 'pending' && (
                        <button
                          onClick={() => onUpdateStatus(account.id, 'pending')}
                          disabled={isPending || loadingId === account.id}
                          className="rounded bg-white/10 px-2.5 py-1 text-xs font-medium text-gray-300 hover:bg-white/20 disabled:opacity-50 transition-colors"
                        >
                          Revert
                        </button>
                      )}
                      {loadingId === account.id && (
                        <span className="text-gray-500 text-xs">Saving…</span>
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

// ── Content Tab ───────────────────────────────────────────────────────────────

function ContentTab({ config, secret }: { config: SiteConfig; secret: string }) {
  const router = useRouter()
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Local state for each section
  const [prices, setPrices] = useState({
    price_b2c_usd: config.price_b2c_usd,
    price_b2b_usd: config.price_b2b_usd,
    stock: config.stock,
  })
  const [ticker, setTicker] = useState({
    ticker_he: config.ticker_he,
    ticker_en: config.ticker_en,
  })
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ key, value }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Save failed')
      }
      setSaved(sectionId)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
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
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${secret}`,
          },
          body: JSON.stringify({ key, value }),
        })
        if (!res.ok) {
          const data = await res.json() as { error?: string }
          throw new Error(data.error ?? 'Save failed')
        }
      }
      setSaved(sectionId)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(null)
    }
  }

  const inputCls = 'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none'
  const labelCls = 'mb-1 block text-xs font-medium text-gray-400'
  const saveBtnCls = (id: string) =>
    `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      saving === id ? 'bg-white/10 text-gray-400' : 'bg-brand-600 text-white hover:bg-brand-500'
    }`

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-500/20 border border-red-500/30 p-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Prices & Stock */}
      <Section title="Prices & Stock" savedId={saved} sectionId="prices">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>B2C Price (USD)</label>
            <input
              type="number"
              className={inputCls}
              value={prices.price_b2c_usd}
              onChange={(e) => setPrices((p) => ({ ...p, price_b2c_usd: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className={labelCls}>B2B Box Price (USD)</label>
            <input
              type="number"
              className={inputCls}
              value={prices.price_b2b_usd}
              onChange={(e) => setPrices((p) => ({ ...p, price_b2b_usd: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className={labelCls}>Stock (0 = out of stock)</label>
            <input
              type="number"
              className={inputCls}
              value={prices.stock}
              onChange={(e) => setPrices((p) => ({ ...p, stock: Number(e.target.value) }))}
            />
          </div>
        </div>
        <SaveRow
          sectionId="prices"
          saving={saving}
          saved={saved}
          onSave={() =>
            saveSection('prices', [
              ['price_b2c_usd', prices.price_b2c_usd],
              ['price_b2b_usd', prices.price_b2b_usd],
              ['stock', prices.stock],
            ])
          }
        />
      </Section>

      {/* Ticker */}
      <Section title="Ticker Bar Text" savedId={saved} sectionId="ticker">
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Hebrew</label>
            <input
              type="text"
              className={inputCls}
              value={ticker.ticker_he}
              onChange={(e) => setTicker((t) => ({ ...t, ticker_he: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>English</label>
            <input
              type="text"
              className={inputCls}
              value={ticker.ticker_en}
              onChange={(e) => setTicker((t) => ({ ...t, ticker_en: e.target.value }))}
            />
          </div>
        </div>
        <SaveRow
          sectionId="ticker"
          saving={saving}
          saved={saved}
          onSave={() =>
            saveSection('ticker', [
              ['ticker_he', ticker.ticker_he],
              ['ticker_en', ticker.ticker_en],
            ])
          }
        />
      </Section>

      {/* Social Links */}
      <Section title="Social Links" savedId={saved} sectionId="socials">
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Instagram URL</label>
            <input
              type="text"
              className={inputCls}
              value={socials.instagram_url}
              onChange={(e) => setSocials((s) => ({ ...s, instagram_url: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>Facebook URL</label>
            <input
              type="text"
              className={inputCls}
              value={socials.facebook_url}
              onChange={(e) => setSocials((s) => ({ ...s, facebook_url: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>WhatsApp Number (with country code, e.g. +972501234567)</label>
            <input
              type="text"
              className={inputCls}
              placeholder="+972501234567"
              value={socials.whatsapp_number}
              onChange={(e) => setSocials((s) => ({ ...s, whatsapp_number: e.target.value }))}
            />
          </div>
        </div>
        <SaveRow
          sectionId="socials"
          saving={saving}
          saved={saved}
          onSave={() =>
            saveSection('socials', [
              ['instagram_url', socials.instagram_url],
              ['facebook_url', socials.facebook_url],
              ['whatsapp_number', socials.whatsapp_number],
            ])
          }
        />
      </Section>

      {/* Shipping */}
      <Section title="Shipping Settings" savedId={saved} sectionId="shipping">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Free Shipping Countries (comma-separated codes)</label>
            <input
              type="text"
              className={inputCls}
              placeholder="IL, US"
              value={shipping.free_shipping_countries}
              onChange={(e) => setShipping((s) => ({ ...s, free_shipping_countries: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>Min Qty for Free Intl Shipping</label>
            <input
              type="number"
              className={inputCls}
              value={shipping.free_shipping_min_qty}
              onChange={(e) => setShipping((s) => ({ ...s, free_shipping_min_qty: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className={labelCls}>Intl Shipping Cost (USD)</label>
            <input
              type="number"
              className={inputCls}
              value={shipping.intl_paid_shipping_usd}
              onChange={(e) => setShipping((s) => ({ ...s, intl_paid_shipping_usd: Number(e.target.value) }))}
            />
          </div>
        </div>
        <SaveRow
          sectionId="shipping"
          saving={saving}
          saved={saved}
          onSave={() =>
            saveSection('shipping', [
              ['free_shipping_countries', shipping.free_shipping_countries.split(',').map((s) => s.trim()).filter(Boolean)],
              ['free_shipping_min_qty', shipping.free_shipping_min_qty],
              ['intl_paid_shipping_usd', shipping.intl_paid_shipping_usd],
            ])
          }
        />
      </Section>

      {/* Instagram Reels */}
      <Section title="Instagram Reels" savedId={saved} sectionId="reels">
        <div className="space-y-3">
          {reels.map((reel, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="flex-1">
                <label className={labelCls}>Video URL (MP4 in Supabase Storage)</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="https://..."
                  value={reel.video_url}
                  onChange={(e) => {
                    const updated = [...reels]
                    updated[i] = { ...updated[i], video_url: e.target.value }
                    setReels(updated)
                  }}
                />
              </div>
              <div className="flex-1">
                <label className={labelCls}>Instagram Link (optional)</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="https://instagram.com/reel/..."
                  value={reel.link_url ?? ''}
                  onChange={(e) => {
                    const updated = [...reels]
                    updated[i] = { ...updated[i], link_url: e.target.value || null }
                    setReels(updated)
                  }}
                />
              </div>
              <button
                onClick={() => setReels(reels.filter((_, j) => j !== i))}
                className="mt-5 rounded bg-red-900/50 px-2 py-2 text-xs text-red-300 hover:bg-red-800/50 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() => setReels([...reels, { video_url: '', link_url: null }])}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:border-white/20 hover:text-white transition-colors"
          >
            + Add Reel
          </button>
        </div>
        <SaveRow
          sectionId="reels"
          saving={saving}
          saved={saved}
          onSave={() => save('instagram_reels', reels.filter((r) => r.video_url), 'reels')}
        />
      </Section>

      {/* Age Gate */}
      <Section title="Age Gate" savedId={saved} sectionId="agegate">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="size-4 rounded border-white/20 bg-white/5"
            checked={ageGate}
            onChange={(e) => setAgeGate(e.target.checked)}
          />
          <span className="text-sm text-gray-300">Enable 21+ age gate on homepage</span>
        </label>
        <SaveRow
          sectionId="agegate"
          saving={saving}
          saved={saved}
          onSave={() => save('age_gate_enabled', ageGate, 'agegate')}
        />
      </Section>

      {/* Product Colors */}
      <Section title="Product Colors" savedId={saved} sectionId="colors">
        <p className="mb-3 text-xs text-gray-500">Check which colors appear on the product page.</p>
        <div className="space-y-2">
          {[
            { slug: 'purple', label: 'Purple (סגול)' },
            { slug: 'black',  label: 'Black (שחור)' },
            { slug: 'blue',   label: 'Blue (כחול)' },
          ].map(({ slug, label }) => (
            <label key={slug} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="size-4 rounded border-white/20 bg-white/5 accent-brand-500"
                checked={visibleColors.includes(slug)}
                onChange={(e) => {
                  setVisibleColors(e.target.checked
                    ? [...visibleColors, slug]
                    : visibleColors.filter((s) => s !== slug))
                }}
              />
              <span className="text-sm text-gray-300">{label}</span>
            </label>
          ))}
        </div>
        <SaveRow
          sectionId="colors"
          saving={saving}
          saved={saved}
          onSave={() => save('visible_colors', visibleColors, 'colors')}
        />
      </Section>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Section({
  title,
  children,
  savedId,
  sectionId,
}: {
  title: string
  children: React.ReactNode
  savedId: string | null
  sectionId: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">{title}</h2>
        {savedId === sectionId && (
          <span className="text-xs text-green-400">✓ Saved</span>
        )}
      </div>
      {children}
    </div>
  )
}

function SaveRow({
  sectionId,
  saving,
  saved,
  onSave,
}: {
  sectionId: string
  saving: string | null
  saved: string | null
  onSave: () => void
}) {
  return (
    <div className="mt-4 flex justify-end">
      <button
        onClick={onSave}
        disabled={saving === sectionId}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          saving === sectionId
            ? 'bg-white/10 text-gray-400 cursor-not-allowed'
            : 'bg-brand-600 text-white hover:bg-brand-500'
        }`}
      >
        {saving === sectionId ? 'Saving…' : 'Save'}
      </button>
    </div>
  )
}
