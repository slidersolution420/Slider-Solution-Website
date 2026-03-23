import { z } from 'zod'
import { SUPPORTED_COUNTRIES } from './countries'

const countryCodes = SUPPORTED_COUNTRIES.map((c) => c.code) as [
  string,
  ...string[],
]

export const checkoutSchema = z.object({
  cart: z
    .array(
      z.object({
        id: z.string(),
        color: z.enum(['black', 'blue', 'purple', 'mixed']),
        qty: z.number().int().min(1).max(99),
        priceUsd: z.number().positive(),
      }),
    )
    .min(1, 'Cart is empty'),
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    address: z.string().min(3),
    city: z.string().min(2),
    country: z.enum(countryCodes),
    zip: z.string().min(3),
  }),
  currency: z.enum(['USD', 'EUR', 'ILS']),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>

export const wholesaleSignupSchema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    phone: z.string().min(7),
    email: z.string().email(),
    username: z
      .string()
      .min(3)
      .regex(/^[a-zA-Z0-9_]+$/),
    password: z.string().min(8),
    confirmPassword: z.string(),
    storeName: z.string().min(2),
    address: z.string().min(3),
    city: z.string().min(2),
    country: z.enum(countryCodes),
    zip: z.string().min(3),
    consent: z.boolean(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type WholesaleSignupInput = z.infer<typeof wholesaleSignupSchema>
