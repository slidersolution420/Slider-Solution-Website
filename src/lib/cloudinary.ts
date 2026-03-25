/**
 * lib/cloudinary.ts
 * ALL Cloudinary logic lives here only.
 * Product image map, URL builder, and gradient fallbacks.
 */

import type { ProductColor } from './types'

// ─── Product image public IDs ────────────────────────────────────────────────

export const PRODUCT_IMAGES = {
  'kit-black': 'slider/kit-black',
  'kit-blue': 'slider/kit-blue',
  'kit-purple': 'slider/kit-purple',
  'kit-exploded': 'slider/kit-exploded',
  'display-front': 'slider/display-box-front',
  'display-side': 'slider/display-box-side',
  'display-top': 'slider/display-box-top',
  'logo-white': 'slider/logo-white',
} as const

export type ProductImageKey = keyof typeof PRODUCT_IMAGES

// ─── Gradient fallbacks per image key ───────────────────────────────────────

export const COLOR_GRADIENTS: Record<string, string> = {
  'kit-black': 'from-gray-900 to-gray-700',
  'kit-blue': 'from-blue-900 to-blue-600',
  'kit-purple': 'from-purple-900 to-purple-600',
  'kit-exploded': 'from-slate-800 to-slate-600',
  'display-front': 'from-gray-900 via-blue-900 to-purple-800',
  'display-side': 'from-gray-900 to-gray-700',
  'display-top': 'from-gray-900 to-gray-700',
}

// ─── Color → image key map ───────────────────────────────────────────────────

export const COLOR_IMAGE_KEYS: Record<ProductColor, ProductImageKey> = {
  black: 'kit-black',
  blue: 'kit-blue',
  purple: 'kit-purple',
  mixed: 'display-front',
}

// ─── URL builder ─────────────────────────────────────────────────────────────

/**
 * Build a Cloudinary delivery URL for a given public ID.
 * Returns empty string when NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set.
 */
export function cloudinaryUrl(
  publicId: string,
  options: { width?: number; quality?: string; format?: string } = {},
): string {
  const { width = 800, quality = 'auto', format = 'auto' } = options
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName || cloudName === 'placeholder') return ''
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_${format},q_${quality},w_${width}/${publicId}`
}

/**
 * Get the Cloudinary URL for a product image by logical key.
 * Returns empty string when not configured or key not found.
 */
export function getProductImageUrl(
  key: string,
  transforms: string = 'f_auto,q_auto',
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName || cloudName === 'placeholder') return ''
  const publicId = PRODUCT_IMAGES[key as ProductImageKey]
  if (!publicId) return ''
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`
}

/**
 * Returns the Tailwind gradient fallback for a product color.
 */
export function getProductFallbackGradient(color: ProductColor): string {
  const key = COLOR_IMAGE_KEYS[color]
  return COLOR_GRADIENTS[key] ?? 'from-gray-900 to-gray-700'
}
