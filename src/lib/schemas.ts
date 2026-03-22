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
        color: z.enum(['black', 'blue', 'purple']),
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
