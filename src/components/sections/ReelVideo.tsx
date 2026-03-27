'use client'

import { useEffect, useRef } from 'react'

interface ReelVideoProps {
  videoUrl: string
  linkUrl?: string | null
}

export default function ReelVideo({ videoUrl, linkUrl }: ReelVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !video.src) {
          video.src = videoUrl
          video.load()
        }
      },
      { rootMargin: '50px' }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [videoUrl])

  const inner = (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      className="h-[480px] w-full object-cover"
    />
  )

  if (linkUrl) {
    return (
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-2xl border border-white/10 transition-colors hover:border-white/25"
      >
        {inner}
      </a>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      {inner}
    </div>
  )
}
