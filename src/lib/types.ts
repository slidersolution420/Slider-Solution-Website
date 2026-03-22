export type ProductColor = 'black' | 'blue' | 'purple'

export type Currency = 'USD' | 'EUR' | 'ILS'

export type OrderType = 'b2c' | 'b2b'

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type WholesaleAccountStatus = 'active' | 'blocked'

export type CartSessionStatus = 'active' | 'completed' | 'abandoned'

export interface CartItem {
  productId: string
  color: ProductColor
  qty: number
  priceUsd: number
  type: OrderType
}

export interface ShippingAddress {
  line1: string
  line2?: string
  city: string
  state?: string
  country: string
  zip: string
}

export interface Order {
  id: string
  email: string
  name: string
  shippingAddress: ShippingAddress
  country: string
  items: CartItem[]
  totalUsd: number
  status: OrderStatus
  hypePaymentId?: string
  tapuzTrackingNumber?: string
  type: OrderType
  createdAt: string
}

export interface WholesaleAccount {
  id: string
  userId: string
  businessName: string
  contactName: string
  phone: string
  username: string
  storeName: string
  address: string
  city: string
  country: string
  zip: string
  status: WholesaleAccountStatus
  approvedAt?: string
  createdAt: string
}

export interface ShippingResult {
  cost: number
  message: string
  isFree: boolean
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}

export interface Review {
  id: string
  name: string
  rating: 1 | 2 | 3 | 4 | 5
  body: string
  approved: boolean
  createdAt: string
}

export interface Product {
  id: string
  name: string
  color: ProductColor
  sku: string
  priceUsd: number
  type: OrderType
  stock: number
}

export interface ModalState {
  cart: boolean
  wholesale: boolean
  ageGate: boolean
  exitIntent: boolean
}
