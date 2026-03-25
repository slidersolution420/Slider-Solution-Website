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

// Gradient fallbacks per image key (used when Cloudinary image not yet uploaded)
export const COLOR_GRADIENTS: Record<string, string> = {
  'kit-black': 'from-gray-900 to-gray-700',
  'kit-blue': 'from-blue-900 to-blue-600',
  'kit-purple': 'from-purple-900 to-purple-600',
  'kit-exploded': 'from-slate-800 to-slate-600',
  'display-front': 'from-gray-900 via-blue-900 to-purple-800',
  'display-side': 'from-gray-900 to-gray-700',
  'display-top': 'from-gray-900 to-gray-700',
}

export function cloudinaryUrl(
  publicId: string,
  options: { width?: number; quality?: string; format?: string } = {},
): string {
  const { width = 800, quality = 'auto', format = 'auto' } = options
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName || cloudName === 'placeholder') {
    return '' // triggers fallback gradient in component
  }
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_${format},q_${quality},w_${width}/${publicId}`
}
