export function cloudinaryUrl(
  publicId: string,
  options: { width?: number; quality?: string; format?: string } = {},
): string {
  const { width = 800, quality = 'auto', format = 'auto' } = options
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName) return `/placeholder-${publicId}.jpg`
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_${format},q_${quality},w_${width}/${publicId}`
}
