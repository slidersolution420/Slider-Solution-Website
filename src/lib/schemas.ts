import { z } from 'zod'

export const cartItemSchema = z.object({
  productId: z.string(),
  color: z.string(),
  quantity: z.number().int().min(1).max(10),
  priceUsd: z.number().positive(),
  name: z.string(),
})

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  currency: z.enum(['ILS', 'USD']),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  address: z.string().min(3),
  city: z.string().min(2),
  country: z.string().length(2),
  zip: z.string().min(2),
})

export const wholesaleSignupSchema = z.object({
  business_name: z.string().min(2),
  contact_name: z.string().min(2),
  phone: z.string().min(7),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  store_name: z.string().min(2),
  address: z.string().min(5),
  city: z.string().min(2),
  country: z.string().length(2),
  zip: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

export const wholesaleLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
export type WholesaleSignupInput = z.infer<typeof wholesaleSignupSchema>
export type WholesaleLoginInput = z.infer<typeof wholesaleLoginSchema>
