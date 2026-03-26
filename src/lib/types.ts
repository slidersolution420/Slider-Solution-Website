export interface ReelItem {
  video_url: string
  link_url: string | null
}

export interface SiteConfig {
  price_b2c_usd: number
  price_b2b_usd: number
  stock: number
  ticker_he: string
  ticker_en: string
  instagram_url: string
  facebook_url: string
  whatsapp_number: string
  instagram_reels: ReelItem[]
  free_shipping_countries: string[]
  free_shipping_min_qty: number
  intl_paid_shipping_usd: number
  age_gate_enabled: boolean
  visible_colors: string[]
  ticker_enabled: boolean
}

export type Locale = 'he' | 'en'

export type Currency = 'ILS' | 'USD'

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type OrderType = 'b2c' | 'b2b'

export type WholesaleAccountStatus = 'pending' | 'active' | 'blocked'

export interface CartItem {
  productId: string
  color: string
  quantity: number
  priceUsd: number
  name: string
}

export interface ShippingAddress {
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  zip: string
}

export interface Order {
  id: string
  email: string
  name: string
  shipping_address: ShippingAddress
  country: string
  items: CartItem[]
  total_usd: number
  status: OrderStatus
  hype_payment_id: string | null
  tapuz_tracking_number: string | null
  type: OrderType
  created_at: string
  updated_at: string
}

export interface WholesaleAccount {
  id: string
  user_id: string
  business_name: string
  contact_name: string
  phone: string
  username: string
  store_name: string
  address: string
  city: string
  country: string
  zip: string
  status: WholesaleAccountStatus
  approved_at: string | null
  created_at: string
}

export interface Review {
  id: string
  name: string
  rating: number
  body: string
  approved: boolean
  created_at: string
}

export interface CartSession {
  id: string
  email: string | null
  cart: CartItem[]
  status: 'active' | 'completed' | 'abandoned'
  created_at: string
  updated_at: string
}
