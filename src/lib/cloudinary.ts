/**
 * lib/cloudinary.ts
 * ALL Cloudinary logic lives here only.
 * Product image map, URL builder, and gradient fallbacks.
 */

import type { ProductColor } from './types'

// ─── Product image public IDs ───────────────────────────────────────────────

export const PRODUCT_IMAGES: Record<string, string> = {
  'kit-black': 'slider/kit-black',
  'kit-blue': 'slider/kit-blue',
  'kit-purple': 'slider/kit-purple',
  'kit-exploded': 'slider/kit-exploded',
  'display-box-front': 'slider/display-box-front',
  'display-box-side': 'slider/display-box-side',
  'display-box-top': 'slider/display-box-top',
}

// ─── Gradient fallbacks ─────────────────────────────────────────────────────

const COLOR_GRADIENTS: Record<ProductColor, string> = {
  black: 'from-gray-900 to-gray-700',
  blue: 'from-blue-900 to-blue-600',
  purple: 'from-purple-900 to-purple-600',
  mixed: 'from-gray-900 via-blue-900 to-purple-800',
}

/**
 * Returns a Tailwind gradient class string for the given product color.
 * Used as a visual fallback when Cloudinary images are not yet uploaded.
 */
export function getProductFallbackGradient(color: ProductColor): string {
  return COLOR_GRADIENTS[color]
}

// ─── URL builder ────────────────────────────────────────────────────────────

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ''

/**
 * Build a Cloudinary delivery URL for a product image.
 * Returns an empty string when NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set
 * or when the key is not found in PRODUCT_IMAGES.
 *
 * @param key    - Logical image name (e.g. 'kit-black', 'display-box-front')
 * @param transforms - Optional Cloudinary transform string (e.g. 'w_800,f_auto,q_auto')
 */
export function getProductImageUrl(
  key: string,
  transforms: string = 'f_auto,q_auto',
): string {
  if (!CLOUD_NAME) return ''

  const publicId = PRODUCT_IMAGES[key]
  if (!publicId) return ''

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`
}

/**
 * Check whether Cloudinary is configured and a given image key exists.
 */
export function hasProductImage(key: string): boolean {
  return !!getProductImageUrl(key)
}
