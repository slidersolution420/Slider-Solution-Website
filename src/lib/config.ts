/**
 * Runtime site configuration backed by Supabase `site_config` table.
 *
 * Values are editable in the admin dashboard at /admin?secret=CRON_SECRET
 * and take effect immediately — no rebuild required.
 *
 * Falls back to hardcoded defaults if Supabase is unreachable.
 * Server-only — never import in Client Components.
 */
import 'server-only'
import { createServiceClient } from '@/lib/supabase-server'
import type { ReelItem, SiteConfig } from '@/lib/types'

export type { ReelItem, SiteConfig }

const DEFAULTS: SiteConfig = {
  price_b2c_usd: 25,
  price_b2b_usd: 82,
  stock: 999,
  ticker_he: '✦ משלוח חינם בכל הארץ ✦ ממציאי הסלייד המקוריים ✦ +1,000 לקוחות מרוצים ✦',
  ticker_en: '✦ Free Shipping Nationwide ✦ The Original Slider Kit ✦ 1,000+ Happy Customers ✦',
  instagram_url: 'https://www.instagram.com/slider.solution',
  facebook_url: 'https://www.facebook.com/profile.php?id=100094631066285',
  whatsapp_number: '',
  instagram_reels: [],
  free_shipping_countries: ['IL'],
  free_shipping_min_qty: 3,
  intl_paid_shipping_usd: 25,
  age_gate_enabled: true,
}

export async function getConfig(): Promise<SiteConfig> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('site_config')
      .select('key, value')

    if (error ?? !data) return DEFAULTS

    const map = Object.fromEntries(data.map((row) => [row.key, row.value]))

    return {
      price_b2c_usd:           (map.price_b2c_usd           as number)    ?? DEFAULTS.price_b2c_usd,
      price_b2b_usd:           (map.price_b2b_usd           as number)    ?? DEFAULTS.price_b2b_usd,
      stock:                   (map.stock                   as number)    ?? DEFAULTS.stock,
      ticker_he:               (map.ticker_he               as string)    ?? DEFAULTS.ticker_he,
      ticker_en:               (map.ticker_en               as string)    ?? DEFAULTS.ticker_en,
      instagram_url:           (map.instagram_url           as string)    ?? DEFAULTS.instagram_url,
      facebook_url:            (map.facebook_url            as string)    ?? DEFAULTS.facebook_url,
      whatsapp_number:         (map.whatsapp_number         as string)    ?? DEFAULTS.whatsapp_number,
      instagram_reels:         (map.instagram_reels         as ReelItem[]) ?? DEFAULTS.instagram_reels,
      free_shipping_countries: (map.free_shipping_countries as string[])  ?? DEFAULTS.free_shipping_countries,
      free_shipping_min_qty:   (map.free_shipping_min_qty   as number)    ?? DEFAULTS.free_shipping_min_qty,
      intl_paid_shipping_usd:  (map.intl_paid_shipping_usd  as number)    ?? DEFAULTS.intl_paid_shipping_usd,
      age_gate_enabled:        (map.age_gate_enabled        as boolean)   ?? DEFAULTS.age_gate_enabled,
    }
  } catch {
    return DEFAULTS
  }
}

export async function updateConfig(key: keyof SiteConfig, value: SiteConfig[typeof key]): Promise<void> {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('site_config')
    .upsert({ key, value }, { onConflict: 'key' })

  if (error) throw new Error(error.message)
}
